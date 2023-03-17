import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './services/whatsapp/whatsapp.service';
import { HttpHookClient } from '../clients/clients/http_hook.client';
import { HttpModule } from '@nestjs/axios';
import { WppConnectClient } from '../utils/engines/wppconnect/wppconnect';
import { MessageController } from './whatsapp-message/message.controller';
import { ChatController } from './whatsapp-chat/chat.controller';

@Module({
  imports: [HttpModule],
  controllers: [WhatsappController, MessageController, ChatController],
  providers: [WhatsappService, HttpHookClient, WppConnectClient],
})
export class WhatsappModule {}
