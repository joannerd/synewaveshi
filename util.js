class ChatNode {
  constructor(value, user) {
    this.timestamp = this.getTimestamp();
    this.value = value;
    this.user = user;
    this.next = null;
  }

  getTimestamp() {
    const currentDate = new Date(Date.now());
    let H = currentDate.getHours();
    let MM = currentDate.getMinutes();
    let period = 'AM';

    if (H > 12) {
      H = H - 12;
      period = 'PM';
    } else if (H === 0) {
      H = 12;
    }

    if (MM < 10) MM = `0${MM}`;

    return `${H}:${MM} ${period}`;
  }
}

class ChatHistory {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  addMessage(value, user) {
    const node = new ChatNode(value, user);

    if (!node.head) {
      this.head = node;
    } else {
      this.tail.next = node;
    }

    this.tail = node;
    this.length += 1;
    return this;
  }

  toArray() {
    if (!this.head) return [];

    const messages = [];
    let currentNode = this.tail;
    while (currentNode) {
      messages.push({
        timestamp: currentNode.timestamp,
        user: currentNode.user,
        value: currentNode.value,
      });

      currentNode = currentNode.next;
    }

    return messages;
  }

  lastMessage() {
    if (!this.tail) return '';
    return this.tail.value;
  }
}

module.exports = {
  ChatHistory
};