import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop() timestamp: string;
  @Prop() latitude: string;
  @Prop() longitude: string;
  @Prop() temperature: number;
  @Prop() humidity: number;
  @Prop() wind_speed: number;
  @Prop() condition: string;
  @Prop() rain_prob: number;
  
  // Novo campo para o Insight da IA
  @Prop() insight: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);