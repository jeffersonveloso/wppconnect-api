import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SentMessageSuccess } from '../../domain/entities/response/response';
import {
  DefaultParameters,
  MessageData,
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
    @Body() body: MessageData<OutputTextMessage>,
  ) {
    return this.whatsappService.sendTextMessage(instanceKey, body.messageData);
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
    @Body() body: MessageData<OutputTextMessage>,
  ) {
    return this.whatsappService.sendTextWithLinkPreview(
      instanceKey,
      body.messageData,
    );
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
    @Body() body: MessageData<OutputUrlMediaMessage>,
  ) {
    return this.whatsappService.sendUrlMediaMessage(
      instanceKey,
      body.messageData,
    );
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
    @Body() body: MessageData<OutputTemplateButtonMessage>,
  ) {
    return this.whatsappService.sendButtons(instanceKey, body.messageData);
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
    @Body() body: MessageData<OutputListMessage>,
  ) {
    return this.whatsappService.sendListMessage(instanceKey, body.messageData);
  }
}
