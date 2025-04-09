const INITIAL_DIFFICULTY = 2;
const MINING_RATE = 1000;

function cryptoHash(...inputs) {
  return CryptoJS.SHA256(inputs.join("")).toString();
}

class Block {
  constructor({ previousHash, timestamp, data, nonce, difficulty, hash }) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.hash = hash;
  }

  static genesisBlock() {
    return new this({
      timestamp: 1698422400,
      data: "Genesis Block",
      previousHash: null,
      nonce: 0,
      difficulty: INITIAL_DIFFICULTY,
      hash: "0xf45",
    });
  }

  static mineBlock(previousBlock, data) {
    let timestamp, hash;
    const previousHash = previousBlock.hash;
    let { difficulty } = previousBlock;
    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({
        originalBlock: previousBlock,
        timestamp,
      });
      hash = cryptoHash(timestamp, previousHash, nonce, data, difficulty);
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    return new this({ timestamp, previousHash, nonce, difficulty, data, hash });
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;
    if (difficulty < 1) return 1;
    return timestamp - originalBlock.timestamp < MINING_RATE
      ? difficulty + 1
      : difficulty - 1;
  }
}

class Blockchain {
  constructor() {
    this.chain = [Block.genesisBlock()];
  }

  addBlock(data) {
    const previousBlock = this.chain[this.chain.length - 1];
    const newBlock = Block.mineBlock(previousBlock, data);
    this.chain.push(newBlock);
    return newBlock;
  }
}

const blockchain = new Blockchain();
const blockchainContainer = document.getElementById("blockchain");

function renderBlock(block, index) {
  const blockElement = document.createElement("div");
  blockElement.className =
    "bg-gray-800 p-4 rounded-lg shadow-md border border-cyan-400 animate-block";

  blockElement.innerHTML = `
    <p><strong>Index:</strong> ${index}</p>
    <p><strong>Timestamp:</strong> ${block.timestamp}</p>
    <p><strong>Data:</strong> ${block.data}</p>
    <p><strong>Nonce:</strong> ${block.nonce}</p>
    <p><strong>Difficulty:</strong> ${block.difficulty}</p>
    <p><strong>Hash:</strong> <span class="break-all text-xs text-green-400">${block.hash}</span></p>
    <p><strong>Prev:</strong> <span class="break-all text-xs text-yellow-400">${block.previousHash}</span></p>
  `;

  blockchainContainer.insertBefore(
    blockElement,
    blockchainContainer.firstChild
  ); // block from bottom to top
}


// Show Genesis Block
blockchain.chain.forEach(renderBlock);

// Button Events
document.getElementById("addBlockBtn").addEventListener("click", () => {
  document.getElementById("blockForm").classList.remove("hidden");
});

document.getElementById("cancelForm").addEventListener("click", () => {
  document.getElementById("blockForm").classList.add("hidden");
  document.getElementById("blockDataInput").value = "";
});

document.getElementById("submitBlock").addEventListener("click", () => {
  const data = document.getElementById("blockDataInput").value.trim();
  const processingText = document.getElementById("processing");

  if (!data) {
    alert("Please enter block data");
    return;
  }

  processingText.classList.remove("hidden");

  setTimeout(() => {
    const newBlock = blockchain.addBlock(data);
    renderBlock(newBlock, blockchain.chain.length - 1);

    processingText.classList.add("hidden");
    document.getElementById("blockForm").classList.add("hidden");
    document.getElementById("blockDataInput").value = "";
  }, 100);
});
