import { Module, Controller, Post, Body, Get, Logger, Res } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { WeatherLog, WeatherLogSchema } from './weather.schema';

@Controller('api/weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(@InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>) {}

  // --- IA Simbólica ---
  private generateInsight(temp: number, humidity: number, wind: number, condition: string): string {
    if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle')) return '🌧️ Alerta de Chuva: Leve guarda-chuva.';
    if (temp > 30) return humidity > 60 ? '🥵 Calor Extremo e Abafado: Hidrate-se bem.' : '☀️ Calor Intenso: Use protetor solar.';
    if (temp < 15) return '❄️ Clima Frio: Recomendado usar casaco.';
    if (wind > 30) return '💨 Alerta de Vendaval: Cuidado com janelas.';
    if (humidity < 30) return '🌵 Umidade Baixa: Beba água.';
    return '✅ Condições Normais: Ótimo dia para atividades!';
  }

  // 1. Recebe dados do Go (Via Fila)
  @Post('logs')
  async create(@Body() createWeatherDto: any) {
    this.logger.log(`Recebendo dados da Fila: ${JSON.stringify(createWeatherDto)}`);
    const insight = this.generateInsight(createWeatherDto.temperature, createWeatherDto.humidity, createWeatherDto.wind_speed, createWeatherDto.condition);
    const createdLog = new this.weatherModel({ ...createWeatherDto, insight });
    return createdLog.save();
  }

  // 2. Atualização Manual (Botão do Frontend) - NOVO!
  @Post('refresh')
  async refreshManual() {
    this.logger.log('Atualização manual solicitada pelo usuário...');
    
    // Busca dados direto da Open-Meteo (Santana de Parnaíba)
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-23.4442&longitude=-46.9205&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,wind_speed_10m&timezone=America%2FSao_Paulo';
    
    const response = await fetch(url);
    const data = await response.json();
    const current = data.current;

    // Monta o objeto igual ao Python faria
    const weatherData = {
      timestamp: new Date().toISOString(),
      latitude: '-23.4442',
      longitude: '-46.9205',
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      wind_speed: current.wind_speed_10m,
      condition: current.precipitation > 0 ? 'Rain' : (current.is_day ? 'Day' : 'Night'),
      rain_prob: current.precipitation || 0
    };

    // Gera insight e salva
    const insight = this.generateInsight(weatherData.temperature, weatherData.humidity, weatherData.wind_speed, weatherData.condition);
    const createdLog = new this.weatherModel({ ...weatherData, insight });
    
    await createdLog.save();
    return { message: 'Atualizado com sucesso!', data: createdLog };
  }

  @Get('logs')
  async findAll() {
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(20).exec();
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const logs = await this.weatherModel.find().sort({ createdAt: -1 }).limit(100).exec();
    const data = logs.map(log => ({ Data: log.timestamp, Temperatura: log.temperature, Umidade: log.humidity, Vento: log.wind_speed, Condicao: log.condition, Insight: log.insight }));
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=relatorio_clima.csv');
    res.send(csv);
  }

  @Get('export/xlsx')
  async exportExcel(@Res() res: Response) {
    const logs = await this.weatherModel.find().sort({ createdAt: -1 }).limit(100).exec();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados Climáticos');
    worksheet.columns = [
      { header: 'Data/Hora', key: 'timestamp', width: 30 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 15 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Insight', key: 'insight', width: 40 },
    ];
    logs.forEach(log => worksheet.addRow(log));
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', 'attachment; filename=relatorio_clima.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }
}

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://gdash-mongo:27017/gdash_db'),
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
  ],
  controllers: [WeatherController],
})
export class AppModule {}