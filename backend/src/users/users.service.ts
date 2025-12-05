import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Cria o usuário admin se não existir (Requisito do Desafio)
  async onModuleInit() {
    const adminEmail = 'admin@example.com';
    const exists = await this.userModel.findOne({ email: adminEmail });
    if (!exists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await this.userModel.create({
        name: 'Admin GDASH',
        email: adminEmail,
        password: hashedPassword,
      });
      this.logger.log('✅ Usuário Admin padrão criado com sucesso!');
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  // Métodos CRUD simplificados
  async create(user: any) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    return this.userModel.create({ ...user, password: hashedPassword });
  }
  
  async findAll() {
    return this.userModel.find().select('-password').exec(); // Não retorna a senha
  }
}