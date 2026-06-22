# Стек
Браузерное расширение на WXT + Vue 3 + TypeScript.

Локализация: `public/_locales/en` и `public/_locales/ru` (язык — по настройкам браузера).

# Сборка и тестирование
- Минимум: Chrome 120+, Firefox 115+, Safari 17+ (macOS).
- Сборки: `wxt build -b chrome | firefox | safari --mv3`
- Safari (MVP): только ручная установка через Xcode / safari-web-extension-converter, без App Store.
- API: только `browser.*` (кроссплатформенно), без chrome-only.
- `host_permissions`: `http://127.0.0.1/*` и `*://*/sd/admin/*`.
- `permissions`: `notifications`, `storage`, `tabs`.

# Совместимость
Chrome, Safari, Firefox. Только MV3.

Настройки хранятся в `browser.storage.local` через `utils/settings.ts`.

# Порядок работы агента
Перед внесением правок перечислить какие файлы будут изменены и кратко объяснить зачем, дождаться подтверждения от пользователя, после чего внести правки.
Коммиты только по запросу пользователя.

# Codestyle
Короткий и понятный код без ущерба качеству.

# UI Style
Простой, приятный стиль. Popup следует `prefers-color-scheme`.

# Архитектура

## Background (`entrypoints/background.ts`)
- Проверка локального сервера каждые 10 секунд (`GET http://127.0.0.1:{port}/`).
- Ручная проверка по сообщению `CHECK_SERVER`.
- Рассылка `SERVER_STATUS_UPDATE` при смене статуса.
- Ответ на `GET_SERVER_STATUS` — текущий статус.
- Отслеживание активной вкладки: `URL_UPDATED` при смене/загрузке вкладки.
- Реакция на смену порта в storage — немедленная перепроверка.
- Иконка расширения: цветная при online, серая при offline (когда будет добавлена серая иконка).

## Локальный сервис (`utils/localServiceConnector.ts`)
Все HTTP-запросы к локальному серверу:
- `GET /` — health check
- `GET /projects` — список проектов
- `POST /pull` — запуск pull

Порт `0` отключает обращения к серверу.

## Сообщения (`utils/messages.ts`)
Типизированный протокол между контекстами:
- `URL_UPDATED` — URL активной вкладки
- `SERVER_STATUS_UPDATE` — статус сервера
- `GET_SERVER_STATUS` / `CHECK_SERVER` — запрос статуса из popup

## Нотификации (`utils/notifications.ts`)
Единая точка входа: `notifications.info()` / `notifications.error()`.
Реализация через `browser.notifications` (системные уведомления ОС).
Учитывает настройку «Оповещения» в options.

# Popup

Ширина 320px. Переход в настройки — кнопка Settings → `options.html`.

### Header
- `SERVER:{port}` — порт из настроек.
- Индикатор online/offline. Клик — ручная проверка через background.

### Body
**Current host** — hostname вкладки, если URL содержит `/sd/` сразу после хоста, иначе `none`.

**Project** — селектор проектов с локального сервера, фильтр по `installationHost === currentHost`. Выбор сохраняется в storage как маппинг host → {name, path}.

**Current src** — код исходника из hash NSD (`#scriptModule:…`, `#script:…`, `#advImportConfig:…`). Кнопка **Pull** — `POST /pull`. Disabled при: нет исходника, нет проекта, сервер offline, порт 0.

### Связь с background
Popup подписан на `URL_UPDATED` и `SERVER_STATUS_UPDATE`. Статус сервера не опрашивается самостоятельно.

Реакция на смену порта и маппингов — через `browser.storage.onChanged`.

# Панель настроек (`options.html`)

1. Порт локального сервера (0–65535, дефолт 8123). Порт 0 отключает локальный сервер.
2. Переключатель оповещений (вкл/выкл `browser.notifications`).
3. Таблица маппингов host → project → path с кнопками добавить, редактировать, удалить.

# Иконка
Базовая заготовка: `icons/nsmp_logo_colored.svg`.
