# NSMP SDK Browser Plugin

Браузерное расширение для работы с плагином для JetBrains Platform NSMP SDK плагином.
Позволяет загружать исходники из GUI инсталляции NSMP в JetBrains Platform IDE с NSMP SDK плагином.

Поддерживаются **Chrome**, **Firefox** и **Safari** (Manifest V3).

## Функционал

- Проверка доступности локального сервера, поднимаемого плагином для IDE (иконка расширения: цветная — online, серая — offline)
- Определение хоста и исходника по URL активной вкладки
- Выбор проекта для хоста и сохранение маппинга `host → project_path`
- Pull исходника на локальный сервер (`POST /pull`)
- Настройки порта, оповещений и маппингов в options
- Локализация: русский и английский (по языку браузера)

## Требования

1. **Chrome** 120+, **Firefox** 115+ или **Safari** 17+ (macOS)
2. [Плагин NSMP SDK для IDE](https://github.com/exeki/nsmp.sdk.intellij_plugin)
3. Инсталляция NSMP (тестировалось только на Naumen Service Desk 4.20+)

## Установка из релиза

Готовые сборки публикуются в [GitHub Releases](https://github.com/exeki/nsmp.sdk.browser_plugin/releases):

| Файл | Браузер |
|------|---------|
| `*-chrome.zip` | Chrome, Edge и другие Chromium-браузеры |
| `*-firefox.zip` | Firefox |
| `*-safari.zip` | Safari (требуется конвертация через Xcode, см. ниже) |

### Chrome / Edge

1. Распакуйте `*-chrome.zip`
2. Откройте `chrome://extensions`
3. Включите «Режим разработчика»
4. «Загрузить распакованное расширение» → выберите распакованную папку

### Firefox

1. Распакуйте `*-firefox.zip`
2. Откройте `about:debugging` → «This Firefox»
3. «Load Temporary Add-on» → выберите `manifest.json` из распакованной папки

Для постоянной установки используйте [Firefox Add-ons](https://addons.mozilla.org/) (после публикации) или signed XPI.

### Safari

1. Распакуйте `*-safari.zip`
2. Конвертируйте через [safari-web-extension-converter](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
3. Соберите и установите через Xcode

## Настройка расширения

Откройте **Settings** в popup или страницу options расширения.

| Параметр | Описание                                                                                           |
|----------|----------------------------------------------------------------------------------------------------|
| **Порт сервера** | Порт локального NSMP SDK сервера (по умолчанию `8123`). Значение `0` отключает обращения к серверу |
| **Оповещения** | Системные уведомления при pull и ошибках                                                           |
| **Маппинги проектов** | Таблица соответствий `хост → путь к проекту`                                                       |

Маппинг можно также задать прямо в popup, находясь на странице NSD (`*/sd/admin/*`).

## Использование popup

1. Откройте страницу NSD с исходником (hash вида `#scriptModule:…`, `#script:…`, `#advImportConfig:…`)
2. Убедитесь, что индикатор сервера **online** (зелёная точка; клик — ручная проверка)
3. Выберите **Project** для текущего хоста
4. Нажмите **Pull** для загрузки текущего исходника

Кнопка Pull недоступна, если: нет исходника в URL ИЛИ не выбран проект ИЛИ сервер offline ИЛИ порт `0`.