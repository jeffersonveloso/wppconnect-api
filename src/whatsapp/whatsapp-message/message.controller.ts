import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SentMessageSuccess } from '../../domain/entities/response/response';
import {
  DefaultParameters,
  OutputListMessage,
  OutputTemplateButtonMessage,
  OutputTextMessage,
  OutputUrlMediaMessage,
  UpdatePresence,
} from '../../domain/entities/whatsapp/whatsapp.entity';
import { WhatsappService } from '../services/whatsapp/whatsapp.service';

@Controller('sendMessage')
@ApiTags('Rotinas de envio de mensagem no whatsapp')
export class MessageController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post(':instanceKey/text')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SentMessageSuccess,
    description: '',
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
    description: '',
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
    description: '',
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
    description: '',
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
    description: '',
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
    description: '',
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
    description: '',
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
