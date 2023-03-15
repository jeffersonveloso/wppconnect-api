/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ConnectionEntity } from '../domain/entities/whatsapp/whatsapp.entity';

export const browserArgs = [
  '--log-level=3',
  '--no-default-browser-check',
  '--disable-site-isolation-trials',
  '--no-experiments',
  '--ignore-gpu-blacklist',
  '--ignore-certificate-errors',
  '--ignore-certificate-errors-spki-list',
  '--disable-gpu',
  '--disable-extensions',
  '--disable-default-apps',
  '--enable-features=NetworkService',
  '--disable-setuid-sandbox',
  '--no-sandbox',
  '--disable-webgl',
  '--disable-threaded-animation',
  '--disable-threaded-scrolling',
  '--disable-in-process-stack-traces',
  '--disable-histogram-customizer',
  '--disable-gl-extensions',
  '--disable-composited-antialiasing',
  '--disable-canvas-aa',
  '--disable-3d-apis',
  '--disable-accelerated-2d-canvas',
  '--disable-accelerated-jpeg-decoding',
  '--disable-accelerated-mjpeg-decode',
  '--disable-app-list-dismiss-on-blur',
  '--disable-accelerated-video-decode',
  '--disable-web-security',
  '--aggressive-cache-discard',
  '--disable-cache',
  '--disable-application-cache',
  '--disable-offline-load-stale-cache',
  '--disk-cache-size=0',
  '--disable-background-networking',
  '--disable-sync',
  '--disable-translate',
  '--hide-scrollbars',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-first-run',
  '--safebrowsing-disable-auto-update',
  '--ignore-ssl-errors',
];
export const clientsArray: ConnectionEntity<any>[] = [];
export const sessions = [];
