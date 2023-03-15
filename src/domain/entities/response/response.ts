import {
  ConnectionInfo,
  EventTypes,
  IncomingCallEventContent,
  MessageDeliveryEventContent,
  MessageKey,
  MessageSent,
  StatusTypes,
} from '@baileys/domain/entities/whatsapp/whatsapp.entity';

export class VoidSuccess {
  success: boolean;

  constructor({ success }: { success: boolean }) {
    Object.assign(this, {
      success,
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
  isReconnecting?: boolean;
  reason?: number | string;
  reasonStatusCode?: number;
  qrcode?: string;

  constructor({
    eventType,
    instanceKey,
    status,
    isReconnecting,
    reason,
    reasonStatusCode,
    qrcode,
  }: {
    eventType: EventTypes;
    instanceKey: string;
    status: StatusTypes;
    isReconnecting?: boolean;
    reason?: number | string;
    reasonStatusCode?: number;
    qrcode?: string;
  }) {
    Object.assign(this, {
      eventType,
      instanceKey,
      status,
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
  update: MessageDeliveryEventContent;

  constructor({
    eventType,
    instanceKey,
    key,
    update,
  }: {
    eventType: EventTypes;
    instanceKey: string;
    key: MessageKey;
    update: MessageDeliveryEventContent;
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
