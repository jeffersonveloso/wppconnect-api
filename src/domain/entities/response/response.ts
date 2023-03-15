import {
  ConnectionInfo,
  EventTypes,
  IncomingCallEventContent,
  MessageKey,
  MessageSent,
  StatusTypes,
} from '../whatsapp/whatsapp.entity';

export class VoidSuccess {
  success: boolean;

  constructor({ success }: { success: boolean }) {
    Object.assign(this, {
      success,
    });
  }
}

export class SuccessResponse<T> {
  success: boolean;
  totalOfRecords?: number;
  data: T | T[];

  constructor({
    success,
    totalOfRecords,
    data,
  }: {
    success: boolean;
    totalOfRecords?: number;
    data: T | T[];
  }) {
    Object.assign(this, {
      success,
      totalOfRecords,
      data,
    });
  }
}

export class SentMessageSuccess {
  success: boolean;
  message: MessageSent;

  constructor({
    success,
    message,
  }: {
    success: boolean;
    message: MessageSent;
  }) {
    Object.assign(this, {
      success,
      message,
    });
  }
}

export class GetConnectionInfoSuccess {
  success: boolean;
  instance: ConnectionInfo;

  constructor({
    success,
    instance,
  }: {
    success: boolean;
    instance: ConnectionInfo;
  }) {
    Object.assign(this, {
      success,
      instance,
    });
  }
}

export class ConnectionEvent {
  eventType: EventTypes;
  instanceKey: string;
  status: StatusTypes;
  progressSync?: number;
  maxSyncTimeout?: number;
  isReconnecting?: boolean;
  reason?: number | string;
  reasonStatusCode?: number;
  qrcode?: string;

  constructor({
    eventType,
    instanceKey,
    status,
    progressSync,
    maxSyncTimeout,
    isReconnecting,
    reason,
    reasonStatusCode,
    qrcode,
  }: {
    eventType: EventTypes;
    instanceKey: string;
    status: StatusTypes;
    progressSync?: number;
    maxSyncTimeout?: number;
    isReconnecting?: boolean;
    reason?: number | string;
    reasonStatusCode?: number;
    qrcode?: string;
  }) {
    Object.assign(this, {
      eventType,
      instanceKey,
      status,
      progressSync,
      maxSyncTimeout,
      isReconnecting,
      reason,
      reasonStatusCode,
      qrcode,
    });
  }
}

export class MessageDeliveryEvent {
  eventType: EventTypes;
  instanceKey: string;
  key: MessageKey;
  update: any;

  constructor({
    eventType,
    instanceKey,
    key,
    update,
  }: {
    eventType: EventTypes;
    instanceKey: string;
    key: MessageKey;
    update: any;
  }) {
    Object.assign(this, {
      eventType,
      instanceKey,
      key,
      update,
    });
  }
}

export class MessageReceivedEvent {
  eventType: EventTypes;
  instanceKey: string;
  remoteJid: string;
  fromGroup: boolean;
  messageType: string;
  message: Record<string, any>;

  constructor({
    eventType,
    instanceKey,
    remoteJid,
    messageType,
    fromGroup,
    message,
  }: {
    eventType: EventTypes;
    instanceKey: string;
    remoteJid: string;
    fromGroup: boolean;
    messageType: string;
    message: Record<string, any>;
  }) {
    Object.assign(this, {
      eventType,
      instanceKey,
      remoteJid,
      fromGroup,
      messageType,
      message,
    });
  }
}

export class IncomingCallEvent {
  eventType: EventTypes;
  instanceKey: string;
  call: IncomingCallEventContent;

  constructor({
    eventType,
    instanceKey,
    call,
  }: {
    eventType: EventTypes;
    instanceKey: string;
    call: IncomingCallEventContent;
  }) {
    Object.assign(this, {
      eventType,
      instanceKey,
      call,
    });
  }
}
