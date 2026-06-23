@echo off
chcp 65001 >nul
echo 🚀 Начинаем сборку Angular...

:: Запускаем прод-сборку
call npm run build -- --configuration production

echo 🧹 Очищаем старые файлы в IIS...
:: Замените путь на вашу реальную папку IIS
set IIS_PATH="C:\inetpub\wwwroot\PhoneStoreUI"

:: Удаляем старое и создаем папку заново, чтобы не оставалось мусора
rmdir /s /q %IIS_PATH%
mkdir %IIS_PATH%

echo 📦 Копируем новые файлы...
:: Начиная с Angular 17/18, файлы лежат в подпапке browser!
:: Убедитесь, что путь dist\ваше-имя-проекта\browser указан верно
xcopy /s /e /y "dist\phone-store\browser\*" %IIS_PATH%\

echo ✅ Готово! Фронтенд обновлен.
pause