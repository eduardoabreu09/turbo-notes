# Open Notes
### Open Notes é um aplicativo Android e iOS que transforma fotos e áudio em notas. O usuário envia um áudio ou imagem de uma anotação feita em caderno ou lousa e o app gera uma versão transcrita e resumida em Markdown. O processo é feito localmente, assegurando a privacidade dos dados.

## Requisitos Funcionais
1. O usuário deve conseguir baixar o modelo da IA no seu dispositivo para rodar localmente.
2. O usuário deve conseguir adicionar uma imagem da galeria ou tirar uma foto para enviar para a IA.
3. O usuário deve conseguir enviar um áudio para ser transcrito pela IA e adicionar uma nota.
4. O usuário deve conseguir adicionar um "prompt" para ajudar a IA na sua transcrição.
5. O usuário pode editar as notas depois que elas foram produzidas.
6. O usuário deve conseguir exportar essas notas em um arquivo .md, salvando localmente no dispositivo.
7. O usuário deve conseguir selecionar um modelo de IA. Limitado ao seu dispositivo

### Ideias:
1. Compartilhar notas: compartilhar notas criptografadas com uma chave de acesso, arquivo deve ser comprimido e para acessá-lo precisa de uma chave.
2. Histórico de mudanças: salvar histórico de mudanças e criar versionamento de cada nota.
3. Pasta com notas: organizar as notas em pastas específicas para cada assunto, tornando o versionamento ainda mais potente.

## Requisitos Não Funcionais
1. Persistência: As notas devem ficar salvas no dispositivo do usuário.
2. Privacidade: Tudo realizado localmente, garantindo a privacidade do usuário. 

## Limitações
1. Usuários com iOS 26+ podem usar Apple Intelligence como opção.
2. Usuário deve ter espaço livre no celular para baixar modelo local.
3. Verificar performance em Android e iOS 18.
4. Verificar se o dispositivo tem RAM para usar app sem crashar.