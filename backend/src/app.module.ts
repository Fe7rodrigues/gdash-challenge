import { Module, Controller, Post, Body, Get, Logger, Res } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { WeatherLog, WeatherLogSchema } from './weather.schema';
import { AuthModule } from './auth/auth.module'; // Importado
import { UsersModule } from './users/users.module'; // Importado

// --- Controller de Clima (Mantido igual) ---
@Controller('api/weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);
  constructor(@InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>) {}

  private generateInsight(temp: number, humidity: number, wind: number, condition: string): string {
    if (condition.toLowerCase().includes('rain')) return '🌧️ Alerta de Chuva.';
    if (temp > 30) return '☀️ Calor Intenso.';
    if (temp < 15) return '❄️ Clima Frio.';
    return '✅ Condições Normais.';
  }

  @Post('logs')
  async create(@Body() createWeatherDto: any) {
    this.logger.log(`Recebendo dados: ${JSON.stringify(createWeatherDto)}`);
    const insight = this.generateInsight(createWeatherDto.temperature, createWeatherDto.humidity, createWeatherDto.wind_speed, createWeatherDto.condition);
    const createdLog = new this.weatherModel({ ...createWeatherDto, insight });
    return createdLog.save();
  }

  @Post('refresh')
  async refreshManual() {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-23.4442&longitude=-46.9205&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,wind_speed_10m&timezone=America%2FSao_Paulo';
    const response = await fetch(url);
    const data = await response.json();
    const current = data.current;
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
    const insight = this.generateInsight(weatherData.temperature, weatherData.humidity, weatherData.wind_speed, weatherData.condition);
    const createdLog = new this.weatherModel({ ...weatherData, insight });
    await createdLog.save();
    return { message: 'Atualizado', data: createdLog };
  }

  @Get('logs')
  async findAll() {
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(20).exec();
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const logs = await this.weatherModel.find().sort({ createdAt: -1 }).limit(100).exec();
    const data = logs.map(l => ({ Data: l.timestamp, Temp: l.temperature, Umid: l.humidity, Insight: l.insight }));
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=relatorio.csv');
    res.send(csv);
  }

  @Get('export/xlsx')
  async exportExcel(@Res() res: Response) {
    const logs = await this.weatherModel.find().sort({ createdAt: -1 }).limit(100).exec();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados');
    worksheet.columns = [{ header: 'Data', key: 'timestamp' }, { header: 'Temp', key: 'temperature' }, { header: 'Insight', key: 'insight' }];
    logs.forEach(l => worksheet.addRow(l));
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', 'attachment; filename=relatorio.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }
}

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://gdash-mongo:27017/gdash_db'),
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
    AuthModule, // Novo
    UsersModule, // Novo
  ],
  controllers: [WeatherController],
})
export class AppModule {}