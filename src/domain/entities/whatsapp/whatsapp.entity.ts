import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export enum EngineTypes {
  baileys = 'baileys',
  wppconnect = 'wppconnect',
}

export enum ConnectionState {
  open = 'open',
  close = 'close',
  connecting = 'connecting',
  conflict = 'conflict',
}

export enum EventTypes {
  QRCODE = 'QRCODE',
  CONNECTION = 'CONNECTION',
  RECEIVED_MESSAGE = 'RECEIVED_MESSAGE',
  MESSAGE_DELIVERY_STATUS = 'MESSAGE_DELIVERY_STATUS',
  INCOMING_CALL = 'INCOMING_CALL',
  BATTERY_LEVEL = 'BATTERY_LEVEL',
}

export enum StatusTypes {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  REPLACED = 'REPLACED',
  CONNECTING = 'CONNECTING',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  CRASHED = 'CRASHED',
  RECONNECTING = 'RECONNECTING',
  LOGGED_OUT = 'LOGGED_OUT',
  SYNCHRONIZING = 'SYNCHRONIZING',
}

export enum MessageDeliveryStatus {
  ERROR = 0,
  PENDING = 1,
  SERVER_ACK = 2,
  DELIVERY_ACK = 3,
  READ = 4,
  PLAYED = 5,
  DELETED = 6,
}

export enum PresenceTypes {
  unavailable = 'unavailable',
  available = 'available',
  composing = 'composing',
  recording = 'recording',
  paused = 'paused',
}

export interface AccountInfo {
  exists: boolean;
  jid: string;
}

interface ProfileAccountInfo {
  id: string;
  verifiedName?: string;
  name?: string;
}

export interface MessageKey {
  remoteJid?: string;
  fromMe?: boolean;
  id?: string;
  participant?: string;
}

export interface IncomingCallEventContent {
  from: string;
  id: string;
  status: string;
}

export class ConnectionEntity<T> {
  @ApiProperty({ default: process.env.WEBOOK_BASE_URL, required: false })
  webhookUrl?: string;

  @ApiProperty({ default: randomUUID(), required: true })
  instanceKey: string;

  @ApiProperty({ default: false, required: false })
  disableWebhook?: boolean;

  @ApiProperty({ default: false, required: false })
  emitAcks?: boolean;

  @ApiProperty({ default: 0, required: false, maximum: 10, minimum: 6 })
  connectionAttempts?: number;

  @ApiProperty({ default: EngineTypes.wppconnect, required: true })
  engineType: EngineTypes;

  status: StatusTypes;
  urlcode?: string;
  progressSync?: number;
  maxSyncTimeout?: number;
  lockInitialSync?: boolean;
  connected?: boolean;
  newLogin?: boolean;
  client?: T;
}

export class DefaultParameters {
  @ApiProperty({ required: true })
  to: string;
}

export class ConnectionInfo extends ConnectionEntity<any> {
  user: ProfileAccountInfo;
}

export class LinkPreview {
  @ApiProperty()
  canonicalUrl: string;

  @ApiProperty()
  matchedText: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  jpegThumbnailUrl?: string;

  @ApiProperty()
  jpegThumbnailBuffer?: Buffer;
}

export class OutputTextMessage extends DefaultParameters {
  @ApiProperty()
  text: string;

  @ApiPropertyOptional()
  url?: string;

  @ApiPropertyOptional()
  linkPreview?: LinkPreview;
}

export class OutputUrlMediaMessage extends DefaultParameters {
  @ApiProperty({required: true})
  type: 'video' | 'audio' | 'image' | 'document';

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  caption?: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  footer?: string;
}

export class TemplateButton {
  @ApiProperty()
  type: 'replyButton' | 'urlButton' | 'callButton';

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  payload: string;
}

export class OutputTemplateButtonMessage extends DefaultParameters {
  @ApiProperty()
  text: string;

  @ApiPropertyOptional()
  title: string;

  @ApiProperty({ type: [TemplateButton] })
  buttons: TemplateButton[];

  @ApiProperty()
  footerText: string;
}

export class ListRow {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  rowId: string;
}

export class ListSection {
  @ApiProperty()
  title: string;

  @ApiProperty({ type: [ListRow] })
  rows: ListRow[];
}

export class OutputListMessage extends DefaultParameters {
  @ApiProperty()
  buttonText: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [ListSection] })
  sections: ListSection[];

  @ApiProperty()
  listType: number;
}

export class UpdatePresence extends DefaultParameters {
  @ApiProperty({ enum: PresenceTypes, default: PresenceTypes.composing })
  presence: PresenceTypes;
}

export class ReadingMessages extends DefaultParameters {
  @ApiProperty()
  participant: string;

  @ApiProperty()
  messageId: string;
}

export class MessageData<T> {
  @ApiProperty()
  messageData?: T;

  @ApiProperty()
  data: T;
}

export interface MessageSent {
  to: string;
  messageId: string;
  status: string;
  message: any;
}
