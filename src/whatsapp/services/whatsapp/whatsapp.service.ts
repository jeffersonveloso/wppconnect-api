import {
  HttpException,
  HttpStatus,
  Injectable, InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
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
import { readdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

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
    try {
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

        clientsArray[instanceKey] = connectionEntity;

        engine.startConnection(connectionEntity);
      }
    } catch (e) {
      console.log('RECONECT INSTANCES ERROR', e);
    }
  }

  async startConnection(connection: ConnectionEntity<any>) {
    try {
      if (connection.engineType === EngineTypes.wppconnect) {
        return await this.wppConnectClient.startConnection(connection);
      }
    } catch (e) {
      console.log('ERROR: startConnection', e);
      throw new HttpException(
        'Internal server error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getAllInstances() {
    try {
      const clients = [];
      const clientsPersisted = clientsArray;

      for (const instanceKey in clientsPersisted) {
        const client = clientsPersisted[instanceKey];

        clients.push({
          instance_key: client.instanceKey,
          connected: client.connected,
          engine: client.engineType,
          status: client.status,
          user: {
            id: '',
            name: '',
          },
        });
      }

      return clients;
    } catch (e) {
      console.log(`GET ALL INSTANCES ERROR`, e);
    }
  }

  async getTheInstance(instanceKey: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.getTheInstance(connectionEntity);
  }

  async getQrCode(instanceKey: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.getQrCode(connectionEntity);
  }

  async getBase64QrCode(instanceKey: string) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.getBase64QrCode(connectionEntity);
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

  async sendUrlImageMessage(instanceKey: string, data: OutputUrlMediaMessage) {
    const { engine, connectionEntity } = await this.getEngineInstance(
      instanceKey,
    );

    return await engine.sendUrlImageMessage({ connectionEntity, data });
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

        if (connectionEntity.client) {
          await this.wppConnectClient?.isConnected(connectionEntity);
        }

        return { engine, connectionEntity };
      }

      this.deleteSessionDirectory(instanceKey);
    } catch (e) {
      console.log('GET ENGINE INSTANCE ERROR', e);
      if (e instanceof HttpException) {
        throw e;
      }

      this.deleteSessionDirectory(instanceKey);
    }
  }

  async deleteAllOfllineInstances(engine: string) {
        try {
            let instanceKeys: string[] = [];
            const path = `${this.rootPath}/${engine}`
            const listOfFiles = readdirSync(path);

            listOfFiles.map((file) => {
                file != ".gitkeep" ? instanceKeys.push(file) : null;
            });

            instanceKeys.map((key) => {
                if (clientsArray[key] && clientsArray[key].connected === false) {
                    rmSync(`${path}/${key}`, {
                        recursive: true,
                        force: true,
                        maxRetries: 10
                    });

                    delete clientsArray[key];
                }
            });

            return {
                success: false,
                message: `All offline ${engine} instances deleted.`,
            };
        } catch (e) {
            console.log("deleteAllOfllineInstances ERROR", e);
            throw new InternalServerErrorException(e);
        }
    }

    deleteSessionDirectory(instanceKey){
      this.wppConnectClient.deleteSessionDirectory(instanceKey);
      throw new NotFoundException('Instance not found.');
    }
}
