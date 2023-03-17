import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ConnectionEntity,
  DefaultParameters,
  EngineTypes,
  OutputListMessage,
  OutputTemplateButtonMessage,
  OutputTextMessage,
  OutputUrlMediaMessage,
  StatusTypes,
  UpdatePresence,
} from '../../../domain/entities/whatsapp/whatsapp.entity';
import { WppConnectClient } from '../../../utils/engines/wppconnect/wppconnect';
import { clientsArray } from '../../../utils/constants';
import { readdirSync } from 'fs';
import { join } from 'path';
import * as process from 'process';

@Injectable()
export class WhatsappService {
  rootPath = join(__dirname, '../../../..', 'instances');

  constructor(private readonly wppConnectClient: WppConnectClient) {
    this.reconnectSessions();
  }

  getInstanceName(filename): string | null {
    if (filename === '.gitkeep') {
      return null;
    } else if (filename.includes('json')) {
      return null;
    } else {
      return filename;
    }
  }

  async reconnectSessions() {
    // Restore all instances
    const instanceKeys: string[] = [];
    const listOfFiles = readdirSync(`${this.rootPath}/wppconnect`);

    listOfFiles.map((file) => {
      const filename = this.getInstanceName(file);
      if (filename) instanceKeys.push(this.getInstanceName(filename));
    });

    for (const instanceKey of instanceKeys) {
      const engine = this.wppConnectClient;
      const connectionEntity = {
        instanceKey: instanceKey,
        webhookUrl: process.env.WEBOOK_BASE_URL,
        disableWebhook: process.env.DISABLE_WEBHOOK !== 'false',
        emitAcks: process.env.SEND_ACKS !== 'false',
        connectionAttempts: 0,
        engineType: EngineTypes.wppconnect,
        status: StatusTypes.DISCONNECTED,
        progressSync: 0,
        maxSyncTimeout: 0,
        lockInitialSync: false,
        connected: false,
        newLogin: false,
      };

      engine.startConnection(connectionEntity);
    }
  }

  async startConnection(connection: ConnectionEntity<any>) {
    try {
      if (connection.engineType === EngineTypes.wppconnect) {
        return await this.wppConnectClient.startConnection(connection);
      }
    } catch (e) {
      throw new HttpException(
        'Internal server error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getQrcode(instanceKey: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.getQrCode(connectionEntity);
  }

  async isOnWhatsApp(instanceKey: string, remoteJid: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.isRegistered({
      jid: engine.createId(remoteJid),
      connectionEntity,
    });
  }

  async refreshSession(instanceKey: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.refreshSession(connectionEntity);
  }

  async logoutSession(instanceKey: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.logoutSession(connectionEntity);
  }

  async resetSession(instanceKey: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.resetSession(connectionEntity);
  }

  async deleteSession(instanceKey: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.deleteSession(connectionEntity);
  }

  async sendTextMessage(instanceKey: string, data: OutputTextMessage) {
      const { engine, connectionEntity } = await this.getEngineInstance(
        instanceKey,
      );

      return await engine.sendTextMessage({ connectionEntity, data });
  }

  async sendTextWithLinkPreview(instanceKey: string, data: OutputTextMessage) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );
    return await engine.sendTextWithLinkPreview({ connectionEntity, data });
  }

  async sendUrlMediaMessage(instanceKey: string, data: OutputUrlMediaMessage) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.sendUrlMediaMessage({ connectionEntity, data });
  }

  async sendButtons(instanceKey: string, data: OutputTemplateButtonMessage) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.sendButtons({
      data: { to: data.to, buttonData: data },
      connectionEntity,
    });
  }

  async sendListMessage(instanceKey: string, data: OutputListMessage) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.sendListMessage({ data, connectionEntity });
  }

  async presenceSubscribe(instanceKey: string, data: DefaultParameters) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.presenceSubscribe({ data, connectionEntity });
  }

  async updatePresence(instanceKey: string, data: UpdatePresence) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.updatePresence({ data, connectionEntity });
  }

  async getEngineInstance(instanceKey: string) {
    try {
      const connectionEntity: ConnectionEntity<any> | undefined =
        clientsArray[instanceKey];

      if (connectionEntity) {
        const engine = this.wppConnectClient;

        await this.wppConnectClient.isConnected(connectionEntity);

        return { engine, connectionEntity };
      }

      throw new NotFoundException('Instance not found.');
    } catch (e) {
      console.log('GET ENGINE INSTANCE ERROR', e);
      if (e instanceof HttpException) {
        throw e;
      }

      throw new HttpException(
        'Internal server error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}