import * as wppconnect from '@wppconnect-team/wppconnect';
import { Message, MessageType, SocketState } from '@wppconnect-team/wppconnect';
import {
  ConnectionEntity,
  EventTypes,
  LinkPreview,
  MessageDeliveryStatus,
  OutputListMessage,
  OutputTemplateButtonMessage,
  OutputTextMessage,
  OutputUrlMediaMessage,
  PresenceTypes,
  StatusTypes,
  TemplateButton,
  UpdatePresence,
} from '../../../domain/entities/whatsapp/whatsapp.entity';
import {
  ConnectionEvent,
  VoidSuccess,
} from '../../../domain/entities/response/response';
import { join } from 'path';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { browserArgs, clientsArray } from '../../constants';
import { ConnectionState } from '../../../models/wppconnect/connection/connection';
import { getLinkPreview } from 'link-preview-js';
import { HttpHookClient } from '../../../clients/clients/http_hook.client';
import { existsSync, rmSync } from 'fs';
import * as QRCode from 'qrcode';

@Injectable()
export class WppConnectClient {
  rootPath = join(__dirname, '../../../..', 'instances');

  constructor(private readonly hook: HttpHookClient) {}

  sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  createEventUniqueId(): string {
    const unixTimestamp = Math.floor(new Date().getTime() / 1000);
    const uniqueCode = (Math.floor(Math.random() * 100) + 100)
      .toString()
      .substring(1);

    return `${new Date().getFullYear()}${unixTimestamp}${uniqueCode}`;
  }

  private notifyHook(
    event: any,
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>,
  ): Promise<VoidSuccess> {
    return new Promise(async (resolve, reject) => {
      try {
        if (connectionEntity.disableWebhook) {
          return resolve(new VoidSuccess({ success: true }));
        }

        const body = {
          ...event,
          eventId: this.createEventUniqueId(),
          instance_key: event.instanceKey,
          timestamp: new Date(),
        };

        await this.hook.makePostRequest<any>(connectionEntity.webhookUrl, body);

        return resolve(
          new VoidSuccess({
            success: true,
          }),
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  private streamEvents(
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>,
  ) {
    this.checkStateSession(connectionEntity);
    this.listenMessages(connectionEntity);

    if (connectionEntity.emitAcks) {
      this.listenAcks(connectionEntity);
    }
  }

  checkStateSession(connectionEntity: ConnectionEntity<wppconnect.Whatsapp>) {
    connectionEntity.client.onStateChange(async (state) => {
      const conflicts = [SocketState.CONFLICT];

      if (conflicts.includes(state)) {
        await connectionEntity.client.useHere();
      }

      if (SocketState.UNPAIRED.includes(state)) {
        connectionEntity.status = StatusTypes.DISCONNECTED;
        this.updateClient(connectionEntity);

        await this.notifyHook(
          new ConnectionEvent({
            instanceKey: connectionEntity.instanceKey,
            eventType: EventTypes.CONNECTION,
            status: StatusTypes.DISCONNECTED,
          }),
          connectionEntity,
        );
      }
    });
  }

  listenMessages(connectionEntity: ConnectionEntity<wppconnect.Whatsapp>) {
    connectionEntity.client.onMessage(async (message) => {
      const messageType = message.type;
      if (messageType === MessageType.PROTOCOL) return;

      if (message.sender.isMe) return;

      const event = {
        ...this.messageReceiveTreatment(message),
        instanceKey: connectionEntity.instanceKey,
        jid: await connectionEntity.client?.getWid(),
        eventType: EventTypes.RECEIVED_MESSAGE,
      };

      await this.notifyHook(event, connectionEntity);
    });

    connectionEntity.client.onIncomingCall(async (call) => {
      const event = {
        instanceKey: connectionEntity.instanceKey,
        eventType: EventTypes.INCOMING_CALL,
        calls: [
          {
            from: call.peerJid,
            id: call.id,
            isVideo: call.isVideo,
            isGroup: call.isGroup,
            status: 'terminate',
          },
        ],
      };

      await this.notifyHook(event, connectionEntity);
    });
  }

  listenAcks(connectionEntity: ConnectionEntity<wppconnect.Whatsapp>) {
    connectionEntity.client.onAck(async (ack) => {
      const event = {
        key: {
          remoteJid: ack.id.remote,
          fromMe: ack.id.fromMe,
          id: ack.id.id,
        },
        update: {
          status: MessageDeliveryStatus[ack.ack],
        },
      };

      await this.notifyHook(
        {
          instanceKey: connectionEntity.instanceKey,
          eventType: EventTypes.MESSAGE_DELIVERY_STATUS,
          event,
        },
        connectionEntity,
      );
    });
  }

  messageReceiveTreatment(message: Message) {
    const messageTypes = [
      'audio',
      'video',
      'image',
      'sticker',
      'document',
      'contact',
      'location',
      'ptt',
    ];

    const messageEvent = {
      id: message.id,
      messageType: 'conversation',
      fromGroup: message.isGroupMsg,
      pushName: message.sender.pushname,
      key: {
        remoteJid: message.sender.id,
        fromMe: message.sender.isMe,
        id: message.id,
      },
      message: {},
    };

    if (message.type === MessageType.LIST_RESPONSE) {
      messageEvent.messageType = 'messageContextInfo';

      messageEvent.message = {
        listResponseMessage: (message as any)?.listResponse,
      };
    } else if (message.type === MessageType.TEMPLATE_BUTTON_REPLY) {
      messageEvent.message = {
        conversation: message.content,
      };
    } else if (message.type === MessageType.CHAT) {
      messageEvent.message = {
        conversation: message.content,
      };
    } else if (messageTypes.includes(message.type.toLowerCase())) {
      messageEvent.messageType = message.type + 'Message';

      messageEvent.message = {};
      messageEvent.message[messageEvent.messageType] = message;
    } else {
      messageEvent.message = message;
    }

    return messageEvent;
  }

  async exportQrCode({
    qrCode,
    urlCode,
    attempt,
    connectionEntity,
  }: {
    qrCode: string;
    urlCode: string;
    attempt: number;
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
  }) {
    connectionEntity = {
      ...connectionEntity,
      status: StatusTypes.CONNECTING,
      urlcode: urlCode,
      connectionAttempts: attempt,
    };

    this.updateClient(connectionEntity);

    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');

    await this.notifyHook(
      new ConnectionEvent({
        instanceKey: connectionEntity.instanceKey,
        eventType: EventTypes.QRCODE,
        status: StatusTypes.CONNECTING,
        qrcode: 'data:image/png;base64,' + imageBuffer.toString('base64'),
      }),
      connectionEntity,
    );
  }

  createId(jid: string) {
    if (jid.includes('@g.us') || jid.includes('@c.us')) {
      return jid;
    }

    return jid.includes('-') ? `${jid}@g.us` : `${jid}@c.us`;
  }

  // Check if jid is registered on WhatsApp
  async isRegistered({
    jid,
    connectionEntity,
  }: {
    jid: string;
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
  }) {
    if (jid.includes('@g.us')) {
      return { exists: true, jid };
    }

    const result = await connectionEntity.client.checkNumberStatus(
      this.createId(jid),
    );

    if (result.numberExists) {
      return { jid: result.id.user, exists: result.numberExists };
    }

    throw new ForbiddenException('Number not registered on WhatsApp');
  }

  processButtons(buttons: TemplateButton[]) {
    const finalButtons = [];

    buttons.map((button, index) => {
      if (button.type == 'replyButton') {
        finalButtons.push({
          text: button.title ?? '',
          id: index + 1 + '',
        });
      } else if (button.type == 'callButton') {
        finalButtons.push({
          text: button.title ?? '',
          phoneNumber: button.payload ?? '',
        });
      } else if (button.type == 'urlButton') {
        finalButtons.push({
          text: button.title ?? '',
          url: button.payload ?? '',
        });
      }
    });

    return finalButtons;
  }

  async generateLinkPreview(url: string) {
    try {
      const info = await getLinkPreview(url, {
        timeout: 3000,
        followRedirects: 'follow',
      });

      if (info && 'title' in info) {
        return {
          title: info.title,
          description: info.description || '',
          canonicalUrl: info.url,
          matchedText: url,
          doNotPlayInline: true,
        };
      }

      return null;
    } catch (error) {
      console.log('generateLinkPreview error', error);
    }
  }

  async extractLinkPrevThumbs(linkPreview: LinkPreview) {
    try {
      return {
        title: linkPreview.title,
        description: linkPreview.description,
        canonicalUrl: linkPreview.canonicalUrl,
        matchedText: linkPreview.matchedText,
        //thumbnail: linkPreview?.jpegThumbnailUrl,
        doNotPlayInline: true,
      };
    } catch (error) {
      console.log('extractLinkPrevThumbs error', error);
    }
  }

  async getConnectionProgress({
    statusSession,
    session,
    connectionEntity,
  }: {
    statusSession: string;
    session: string;
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
  }) {
    if (
      statusSession === ConnectionState.autoCloseCalled ||
      statusSession === ConnectionState.desconnectedMobile
    ) {
      connectionEntity.status = StatusTypes.DISCONNECTED;
      await connectionEntity.client?.close();
      clientsArray[session] = undefined;
    } else if (
      statusSession === ConnectionState.browserClose ||
      statusSession === ConnectionState.qrReadFail ||
      statusSession === ConnectionState.serverClose
    ) {
      connectionEntity.status = StatusTypes.DISCONNECTED;

      await this.notifyHook(
        new ConnectionEvent({
          instanceKey: connectionEntity.instanceKey,
          eventType: EventTypes.CONNECTION,
          status: StatusTypes.DISCONNECTED,
        }),
        connectionEntity,
      );
    } else if (statusSession === ConnectionState.notLogged) {
      connectionEntity.status =
        connectionEntity.status === StatusTypes.CONNECTED
          ? StatusTypes.DISCONNECTED
          : StatusTypes.CONNECTING;

      await this.notifyHook(
        new ConnectionEvent({
          instanceKey: connectionEntity.instanceKey,
          eventType: EventTypes.CONNECTION,
          status: connectionEntity.status,
        }),
        connectionEntity,
      );
    } else if (
      statusSession === 'isLogged' ||
      statusSession === 'qrReadSuccess'
    ) {
      connectionEntity.status = StatusTypes.SYNCHRONIZING;

      await this.notifyHook(
        new ConnectionEvent({
          instanceKey: connectionEntity.instanceKey,
          eventType: EventTypes.CONNECTION,
          status: StatusTypes.SYNCHRONIZING,
          progressSync: connectionEntity.progressSync,
        }),
        connectionEntity,
      );
    } else if (statusSession === 'inChat') {
      connectionEntity = {
        ...connectionEntity,
        status: StatusTypes.CONNECTED,
        connected: true,
        lockInitialSync: true,
      };

      await this.notifyHook(
        new ConnectionEvent({
          instanceKey: connectionEntity.instanceKey,
          eventType: EventTypes.CONNECTION,
          status: StatusTypes.CONNECTED,
          progressSync: connectionEntity.progressSync,
        }),
        connectionEntity,
      );
    }

    this.updateClient(connectionEntity);
  }

  async getSyncProgress({
    percent,
    message,
    connectionEntity,
  }: {
    percent: number;
    message: string;
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
  }) {
    connectionEntity.status = StatusTypes.SYNCHRONIZING;

    this.setInstanceSyncProgress({ percentage: percent, connectionEntity });

    await this.notifyHook(
      new ConnectionEvent({
        instanceKey: connectionEntity.instanceKey,
        progressSync: connectionEntity.progressSync,
        maxSyncTimeout: connectionEntity.maxSyncTimeout,
        status: StatusTypes.SYNCHRONIZING,
        eventType: EventTypes.CONNECTION,
      }),
      connectionEntity,
    );
  }

  startConnection(
    connection: ConnectionEntity<wppconnect.Whatsapp>,
  ): Promise<VoidSuccess> {
    return new Promise(async (resolve, reject) => {
      try {
        let connectionEntity = this.getClient(connection); //NÃO USAR ISSO, USAR

        if (
          connectionEntity.client != undefined &&
          connectionEntity.status != null &&
          connectionEntity.status !== StatusTypes.DISCONNECTED
        ) {
          return resolve(
            new VoidSuccess({
              success: true,
            }),
          );
        }

        wppconnect.defaultLogger.level = 'error';

        const wppClient = await wppconnect.create({
          session: connectionEntity.instanceKey,
          tokenStore: 'file',
          folderNameToken: `${this.rootPath}/wppconnect`, //folder name when saving tokens
          deviceName: process.env.BROWSER_CLIENT,
          puppeteerOptions: {
            userDataDir: `${this.rootPath}/wppconnect/${connectionEntity.instanceKey}`, // or your custom directory
            executablePath:
              process.platform === 'linux'
                ? '/usr/bin/google-chrome'
                : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          },
          catchQR: (base64Qr, asciiQR, attempt, urlCode) => {
            this.exportQrCode({
              qrCode: base64Qr,
              urlCode,
              attempt,
              connectionEntity,
            });
          },
          onLoadingScreen: (percent, message) => {
            this.getSyncProgress({ percent, message, connectionEntity });
          },
          statusFind: (status, session) => {
            this.getConnectionProgress({
              statusSession: status,
              session,
              connectionEntity,
            });
          },
          headless: true,
          logQR: true,
          browserWS: '',
          useChrome: true,
          updatesLog: false,
          autoClose: 60000,
          browserArgs: browserArgs,
        });

        connectionEntity = {
          ...connectionEntity,
          client: wppClient,
        };

        this.updateClient(connectionEntity);

        this.streamEvents(connectionEntity);

        return resolve(
          new VoidSuccess({
            success: true,
          }),
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  getClient(connection): ConnectionEntity<wppconnect.Whatsapp> {
    let connectionEntity = clientsArray[connection.instanceKey];

    if (!connectionEntity) {
      connectionEntity = clientsArray[connection.instanceKey] = {
        ...connection,
        status: StatusTypes.DISCONNECTED,
        progressSync: 0,
        maxSyncTimeout: 0,
        lockInitialSync: false,
        connected: false,
        newLogin: true,
      };
    }

    return connectionEntity;
  }

  setInstanceSyncProgress({
    percentage,
    connectionEntity,
  }: {
    percentage: number;
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
  }): void {
    connectionEntity.progressSync = percentage;
  }

  async isConnected(
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>,
  ): Promise<boolean> {
    return await connectionEntity.client.isConnected();
  }

  updateClient(connectionEntity: ConnectionEntity<wppconnect.Whatsapp>) {
    const currentConnection = clientsArray[connectionEntity.instanceKey];

    clientsArray[connectionEntity.instanceKey] = {
      ...currentConnection,
      ...connectionEntity,
    };
  }

  async refreshSession(
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>,
  ) {
    try {
      await connectionEntity.client.close();

      connectionEntity = {
        webhookUrl: connectionEntity.webhookUrl,
        instanceKey: connectionEntity.instanceKey,
        disableWebhook: connectionEntity.disableWebhook,
        emitAcks: connectionEntity.emitAcks,
        connectionAttempts: 0,
        engineType: connectionEntity.engineType,
        status: StatusTypes.DISCONNECTED,
        client: undefined,
      };

      this.updateClient(connectionEntity);

      await this.sleep(3000);

      return await this.startConnection(connectionEntity);
    } catch (e) {
      throw new BadRequestException(
        e,
        'One error ocurred when was trying to refresh the session.',
      );
    }
  }

  async logoutSession(connectionEntity: ConnectionEntity<wppconnect.Whatsapp>) {
    try {
      await connectionEntity.client?.logout();

      delete clientsArray[connectionEntity.instanceKey];
      return { success: true, message: 'Instance logged out.' };
    } catch (e) {
      throw new BadRequestException(
        e,
        'One error ocurred when was trying to logout the session.',
      );
    }
  }

  async deleteSession(connectionEntity: ConnectionEntity<wppconnect.Whatsapp>) {
    try {
      await connectionEntity.client?.logout(); //Faz logout gera novamente o qrcode
    } catch (e) {
      const sessionFolder = `${this.rootPath}/wppconnect/${connectionEntity.instanceKey}`;

      if (existsSync(sessionFolder)) {
        rmSync(sessionFolder, {
          force: true,
          recursive: true,
          maxRetries: 10,
        });
      }
    }

    delete clientsArray[connectionEntity.instanceKey];
    return { success: true, message: 'Instance deleted.' };
  }

  async resetSession(connectionEntity: ConnectionEntity<wppconnect.Whatsapp>) {
    try {
      const sessionFolder = `${this.rootPath}/wppconnect/${connectionEntity.instanceKey}`;

      if (existsSync(sessionFolder)) {
        rmSync(sessionFolder, {
          force: true,
          recursive: true,
          maxRetries: 10,
        });
      }

      await connectionEntity.client?.close(); //FECHA O BROWSER

      connectionEntity = {
        webhookUrl: connectionEntity.webhookUrl,
        instanceKey: connectionEntity.instanceKey,
        disableWebhook: connectionEntity.disableWebhook,
        emitAcks: connectionEntity.emitAcks,
        connectionAttempts: 0,
        engineType: connectionEntity.engineType,
        status: StatusTypes.DISCONNECTED,
        client: undefined,
      };

      this.updateClient(connectionEntity);

      await this.sleep(5000);

      return await this.startConnection(connectionEntity);
    } catch (e) {
      throw new BadRequestException(
        e,
        'One error ocurred when was trying to reset the session.',
      );
    }
  }

  async getQrCode(connectionEntity: ConnectionEntity<wppconnect.Whatsapp>) {
    try {
      if (connectionEntity.urlcode) {
        const qr = connectionEntity.urlcode
          ? await QRCode.toDataURL(connectionEntity.urlcode)
          : null;

        const imageBuffer = Buffer.from(
          qr.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
          'base64',
        );

        return {
          success: true,
          message: 'Qrcode generate with successfull',
          qrcode: 'data:image/png;base64,' + imageBuffer.toString('base64'),
        };
      } else {
        return {
          success: false,
          message: 'Qrcode not found.',
          qrcode: '',
        };
      }
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  // send a single message
  async sendTextMessage({
    connectionEntity,
    data,
  }: {
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
    data: OutputTextMessage;
  }) {
    const { jid } = await this.isRegistered({ jid: data.to, connectionEntity });

    return await connectionEntity.client?.sendText(jid, data.text);
  }

  async sendUrlMediaMessage({
    connectionEntity,
    data,
  }: {
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
    data: OutputUrlMediaMessage;
  }) {
    const { jid } = await this.isRegistered({ jid: data.to, connectionEntity });

    return await connectionEntity.client?.sendFile(jid, data.url, {
      caption: data.caption,
      mimetype: data.mimeType,
      type: data.type,
      footer: data.footer,
    });
  }

  async sendButtons({
    connectionEntity,
    data,
  }: {
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
    data: {
      to: string;
      buttonData: OutputTemplateButtonMessage;
    };
  }) {
    const { jid } = await this.isRegistered({ jid: data.to, connectionEntity });

    return await connectionEntity.client?.sendText(
      jid,
      data.buttonData.text ?? '',
      {
        useTemplateButtons: true, // False for legacy
        buttons: this.processButtons(data.buttonData.buttons),
        title: data.buttonData.title ?? '',
        footer: data.buttonData.footerText ?? '',
      },
    );
  }

  async sendListMessage({
    connectionEntity,
    data,
  }: {
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
    data: OutputListMessage;
  }) {
    const { jid } = await this.isRegistered({ jid: data.to, connectionEntity });

    return await connectionEntity.client?.sendListMessage(jid, {
      description: data.text,
      sections: data.sections,
      buttonText: data.buttonText,
      footer: data.description,
      title: data.title,
    });
  }

  async sendTextWithLinkPreview({
    connectionEntity,
    data,
  }: {
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
    data: OutputTextMessage;
  }) {
    const { jid } = await this.isRegistered({ jid: data.to, connectionEntity });

    const result = data.linkPreview
      ? await this.extractLinkPrevThumbs(data.linkPreview)
      : await this.generateLinkPreview(data.url);

    return await connectionEntity.client?.sendText(jid, data.text, {
      linkPreview: result ? result : true,
    });
  }

  async presenceSubscribe({
    connectionEntity,
    data,
  }: {
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
    data: { to: string };
  }) {
    const { jid } = await this.isRegistered({ jid: data.to, connectionEntity });

    return await connectionEntity.client?.subscribePresence(this.createId(jid));
  }

  async presenceSubscribeInAllChats(
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>,
  ) {
    // subcribe all groups participants
    const chats = await connectionEntity.client?.getAllChats();

    return await connectionEntity.client?.subscribePresence(
      chats.map((c) => c.id._serialized),
    );
  }

  async updatePresence({
    connectionEntity,
    data,
  }: {
    connectionEntity: ConnectionEntity<wppconnect.Whatsapp>;
    data: UpdatePresence;
  }) {
    const { jid } = await this.isRegistered({ jid: data.to, connectionEntity });

    if (data.presence === PresenceTypes.available) {
      return await connectionEntity.client?.setOnlinePresence(true);
    } else if (data.presence === PresenceTypes.unavailable) {
      return await connectionEntity.client?.setOnlinePresence(false);
    } else if (data.presence === PresenceTypes.composing) {
      return await connectionEntity.client?.startTyping(jid);
    } else if (data.presence === PresenceTypes.paused) {
      return await connectionEntity.client?.stopTyping(jid);
    }
  }
}
