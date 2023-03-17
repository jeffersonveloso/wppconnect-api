import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SentMessageSuccess,
  VoidSuccess,
} from '../domain/entities/response/response';
import { WhatsappService } from './services/whatsapp/whatsapp.service';
import {
  ConnectionEntity,
  DefaultParameters,
  OutputListMessage,
  OutputTemplateButtonMessage,
  OutputTextMessage,
  OutputUrlMediaMessage,
  UpdatePresence,
} from '../domain/entities/whatsapp/whatsapp.entity';

@Controller('whatsapp')
@ApiTags('Rotinas da automação do whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('connect')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: VoidSuccess,
    description: 'Retorna o sucesso ao conectar com o whatsapp',
  })
  @ApiOperation({
    summary: 'Chamada para realizar a conexão com o whatsapp',
  })
  async connect(@Body() body: ConnectionEntity<any>): Promise<VoidSuccess> {
    return this.whatsappService.startConnection(body);
  }

  @Get('/isOnWhatsApp/:instanceKey')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary: 'Check if number is registerd on WhatsApp',
  })
  async IsOnWhatsApp(
    @Param('instanceKey') instanceKey: string,
    @Query('jid') remoteJid: string,
  ) {
    return this.whatsappService.isOnWhatsApp(instanceKey, remoteJid);
  }

  @Get('qrcode/:instanceKey')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary: 'Get qrcode',
  })
  async getQrcode(@Param('instanceKey') instanceKey: string) {
    return this.whatsappService.getQrcode(instanceKey);
  }

  @Post(':instanceKey/refreshSingleInstance')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: '',
  })
  @ApiOperation({
    summary: 'Refresh session',
  })
  async refreshSession(@Param('instanceKey') instanceKey: string) {
    return this.whatsappService.refreshSession(instanceKey);
  }

  @Post(':instanceKey/logout')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: '',
  })
  @ApiOperation({
    summary: 'Logout session',
  })
  async logoutSession(@Param('instanceKey') instanceKey: string) {
    return this.whatsappService.logoutSession(instanceKey);
  }

  @Post(':instanceKey/reset')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: '',
  })
  @ApiOperation({
    summary: 'Reset session',
  })
  async resetSession(@Param('instanceKey') instanceKey: string) {
    return this.whatsappService.resetSession(instanceKey);
  }

  @Post(':instanceKey/delete')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: '',
  })
  @ApiOperation({
    summary: 'Delete session',
  })
  async deleteSession(@Param('instanceKey') instanceKey: string) {
    return this.whatsappService.deleteSession(instanceKey);
  }

  @Post(':instanceKey/send-text-message')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary: 'Send a text message to an WhatsApp User',
  })
  async sendTextMessage(
    @Param('instanceKey') instanceKey: string,
    @Body() body: OutputTextMessage,
  ) {
    return this.whatsappService.sendTextMessage(instanceKey, body);
  }

  @Post(':instanceKey/text-force-link-preview')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary:
      'Send a text message to an WhatsApp User generating link preview manually',
  })
  async sendTextWithLinkPreview(
    @Param('instanceKey') instanceKey: string,
    @Body() body: OutputTextMessage,
  ) {
    return this.whatsappService.sendTextWithLinkPreview(instanceKey, body);
  }

  @Post(':instanceKey/mediaUrl')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary: 'Send a media message via a URL',
  })
  async sendUrlMediaMessage(
    @Param('instanceKey') instanceKey: string,
    @Body() body: OutputUrlMediaMessage,
  ) {
    return this.whatsappService.sendUrlMediaMessage(instanceKey, body);
  }

  @Post(':instanceKey/templateMessage')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary: 'Send an interactive template buttons message to an WhatsApp User',
  })
  async sendButtons(
    @Param('instanceKey') instanceKey: string,
    @Body() body: OutputTemplateButtonMessage,
  ) {
    return this.whatsappService.sendButtons(instanceKey, body);
  }

  @Post(':instanceKey/listMessage')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary: 'Send an list message to an WhatsApp User',
  })
  async sendListMessage(
    @Param('instanceKey') instanceKey: string,
    @Body() body: OutputListMessage,
  ) {
    return this.whatsappService.sendListMessage(instanceKey, body);
  }

  @Post(':instanceKey/presenceSubscribe')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary: 'Subscribe chat presence',
  })
  async presenceSubscribe(
    @Param('instanceKey') instanceKey: string,
    @Body() body: DefaultParameters,
  ) {
    return this.whatsappService.presenceSubscribe(instanceKey, body);
  }

  @Post(':instanceKey/updatePresence')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: 'Retorna a mensagem enviada.',
  })
  @ApiOperation({
    summary: 'Update chat presence',
  })
  async updatePresence(
    @Param('instanceKey') instanceKey: string,
    @Body() body: UpdatePresence,
  ) {
    return this.whatsappService.updatePresence(instanceKey, body);
  }
}