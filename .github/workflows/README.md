# GitHub Actions Workflows

## Настройка секретов

Для работы workflows необходимо настроить следующие секреты в GitHub:

### Repository Secrets

Перейдите в Settings → Secrets and variables → Actions → New repository secret

1. **DOCKER_USERNAME** - ваш username в Docker Hub
2. **DOCKER_PASSWORD** - ваш password или access token в Docker Hub
3. **SSH_HOST** - IP адрес или домен вашего сервера
4. **SSH_USER** - пользователь для SSH (обычно `root` или `ubuntu`)
5. **SSH_PRIVATE_KEY** - приватный SSH ключ для доступа к серверу

### Как получить SSH ключ

```bash
# На вашей локальной машине
ssh-keygen -t ed25519 -C "github-actions"

# Скопируйте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server

# Скопируйте приватный ключ в GitHub Secrets
cat ~/.ssh/id_ed25519
```

### Docker Hub Access Token

Рекомендуется использовать Access Token вместо пароля:

1. Зайдите в Docker Hub → Account Settings → Security
2. Создайте новый Access Token
3. Используйте его как `DOCKER_PASSWORD`

## Workflows

### deploy.yml

Полнофункциональный workflow с:
- Кешированием Docker слоев
- Множественными тегами
- Метаданными образов
- Health checks

### deploy-simple.yml

Упрощенный workflow для быстрого деплоя:
- Простая сборка и пуш
- Прямой деплой на сервер

## Использование

### Автоматический деплой

Workflow запускается автоматически при:
- Push в ветку `main` или `master`
- Изменениях в директории `calc/`

### Ручной запуск

1. Перейдите в Actions → Build and Deploy
2. Нажмите "Run workflow"
3. Выберите ветку и запустите

## Настройка сервера

На сервере должен быть настроен `docker-compose.prod.yml`:

```bash
# На сервере
cd /opt/CalcProject/calc

# Создайте .env файл
cat > .env << EOF
DOCKER_USERNAME=yourusername
NEXT_PUBLIC_BASE_URL=https://buildcalc.online
EOF

# Убедитесь, что сеть создана
docker network create one-network || true
```

## Troubleshooting

### Ошибка SSH подключения

```bash
# Проверьте SSH ключ
ssh -i ~/.ssh/your_key user@server

# Проверьте права на ключ
chmod 600 ~/.ssh/your_key
```

### Ошибка Docker Hub login

- Проверьте правильность DOCKER_USERNAME и DOCKER_PASSWORD
- Убедитесь, что используете Access Token, а не пароль

### Ошибка деплоя

```bash
# Проверьте логи на сервере
ssh user@server
docker logs buildcalc-app
docker compose ps
```

