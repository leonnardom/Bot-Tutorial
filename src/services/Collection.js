module.exports = class Collection {
  constructor() {
    this.collection = [];
  }

  length() {
    return this.collection.length;
  }

  log() {
    return console.log(this.collection);
  }

  push(value) {
    return this.collection.push(value);
  }

  pushAll(...values) {
    return this.collection.push(...values);
  }

  pop() {
    return this.collection.pop();
  }

  shift() {
    return this.collection.shift();
  }

  unshift(value) {
    return this.collection.unshift(value);
  }

  unshiftAll(...values) {
    return this.collection.unshift(...values);
  }

  remove(index) {
    return this.collection.splice(index, 1);
  }

  add(index, value) {
    return this.collection.splice(index, 0, value);
  }

  replace(index, value) {
    return this.collection.splice(index, 1, value);
  }

  clear() {
    this.collection.length = 0;
  }

  isEmpty() {
    return this.collection.length === 0;
  }

  viewFirst() {
    return this.collection[0];
  }

  viewLast() {
    return this.collection[this.collection.length - 1];
  }

  paginate(page_number, page_size) {
    return this.collection.slice(
      (page_number - 1) * page_size,
      page_number * page_size
    );
  }
};
