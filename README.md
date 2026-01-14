# Fortune Cat - Jogo de Cassino

Um jogo de cassino estilo caça-niquel desenvolvido com HTML5, CSS3 e JavaScript puro, otimizado para desktop e mobile.

## 🎮 Funcionalidades

### Jogo Principal
- **Tabuleiro 3x3** com 9 posições
- **7 símbolos diferentes** com hierarquia de valores:
  - 🐅 Tigre (Wild) - 100x (mais raro)
  - 🐱 Gato - 50x
  - 🐸 Sapo - 30x  
  - 🪙 Pote de Ouro - 20x
  - 🛢️ Barril - 15x
  - 🃏 Carta - 10x
  - 💣 Bomba - 5x

### Sistema de Vitórias
- **Linhas, colunas e diagonais** com 3 símbolos iguais
- **Cartela cheia** (bônus especial)
- **Multiplicadores aleatórios** de 5x a 100x durante o embaralhamento
- **Wild mode** com o tigre (símbolo curinga)

### Interface
- **Design responsivo** para desktop e mobile
- **Controles touch** para dispositivos móveis
- **Animações suaves** com Canvas API
- **Sistema de carteira** com saldo persistente
- **Apostas personalizáveis** (R$ 5 - R$ 500)

## 🚀 Como Jogar

1. **Ajuste sua aposta** usando os botões + e -
2. **Clique em GIRAR** ou deslize para cima no mobile
3. **Espere o embaralhamento** e o multiplicador ser revelado
4. **Verifique as vitórias** em linhas, colunas ou diagonais
5. **Ganhe prêmios** baseados nos símbolos e multiplicadores

## 🎯 Estratégias

- **Aposte dentro do seu limite** para jogar mais tempo
- **Tigre é curinga** - combina com qualquer símbolo
- **Multiplicadores altos** aumentam drasticamente os prêmios
- **Cartela cheia** paga 10x mais que linhas normais

## 🛠️ Tecnologias

- **HTML5 Canvas** para renderização do jogo
- **JavaScript ES6+** vanilla (sem frameworks)
- **CSS3** com animações e design responsivo
- **Web Audio API** para efeitos sonoros
- **LocalStorage** para persistência de dados

## 📱 Compatibilidade

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Chrome Mobile 60+

## 🎲 Probabilidades

- **Tigre (Wild)**: 2% de chance por símbolo
- **Gato**: 8% de chance por símbolo
- **Sapo**: 12% de chance por símbolo
- **Multiplicadores**:
  - 5x-15x: 60% de probabilidade
  - 20x-50x: 35% de probabilidade  
  - 75x-100x: 5% de probabilidade

## 🔧 Desenvolvimento

### Estrutura de Arquivos
```
fortune-cat/
├── index.html              # Página principal
├── styles.css              # Estilos e animações
├── src/
│   ├── game/
│   │   ├── SymbolManager.js      # Gerenciador de símbolos
│   │   ├── WinningDetector.js    # Detector de vitórias
│   │   ├── MultiplierEngine.js   # Motor de multiplicadores
│   │   └── SlotMachine.js         # Controlador principal do jogo
│   └── ui/
│       ├── Canvas.js              # Renderização do canvas
│       └── TouchController.js    # Controles touch
└── package.json            # Configuração do projeto
```

### Para Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone <repository-url>
   cd fortune-cat
   ```

2. **Inicie o servidor:**
   ```bash
   npm run serve
   ```
   
   Ou use Python:
   ```bash
   python3 -m http.server 8000
   ```

3. **Abra no navegador:**
   ```
   http://localhost:8000
   ```

### Para Desenvolvimento

```bash
npm install
npm run dev
```

## 🎨 Personalização

### Adicionar Novos Símbolos
1. Edite `SymbolManager.js`
2. Adicione ao objeto `symbols`
3. Atualize `baseSymbols` array

### Alterar Valores
1. Modifique `multiplier` em `SymbolManager.js`
2. Ajuste pesos em `MultiplierEngine.js`
3. Atualize CSS para cores de prêmios

### Mudar Animações
1. Edite métodos em `Canvas.js`
2. Ajuste timings em `SlotMachine.js`
3. Modifique keyframes em `styles.css`

## 🐛 Bugs e Issues

Reporte problemas através do [GitHub Issues](https://github.com/your-repo/fortune-cat/issues).

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🎮 Créditos

Desenvolvido como projeto de aprendizado de jogos para browser usando tecnologias web modernas.

---

**Aviso**: Este é um jogo de entretenimento apenas. Não envolve dinheiro real e deve ser usado de forma responsável.