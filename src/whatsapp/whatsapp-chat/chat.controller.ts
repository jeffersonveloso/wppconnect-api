import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SentMessageSuccess } from '../../domain/entities/response/response';
import {
  DefaultParameters,
  UpdatePresence,
} from '../../domain/entities/whatsapp/whatsapp.entity';
import { WhatsappService } from '../services/whatsapp/whatsapp.service';

@Controller('chat')
@ApiTags('Rotinas de operacoes no chat do whatsapp')
export class ChatController {
  constructor(private readonly whatsappService: WhatsappService) {}

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
