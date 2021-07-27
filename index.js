const data = [
  { plateNum: 'AT1234', time: '12:23:20', state: 'in' },
  { plateNum: 'AT1234', time: '12:43:12', state: 'out' },
  { plateNum: 'AT1234', time: '14:23:20', state: 'in' },
  { plateNum: 'AT1234', time: '15:56:10', state: 'out' },
  { plateNum: 'AT1256', time: '16:53:20', state: 'in' },
  { plateNum: 'AT1256', time: '17:23:20', state: 'out' },
  { plateNum: 'AT1219', time: '14:23:20', state: 'in' },
  { plateNum: 'AT1219', time: '17:23:20', state: 'out' }
];

function formateTime(timeStr) {
  return Array.prototype.reduce.call(
    timeStr,
    (acc, cur, index) => {
      if (index % 2 === 1 && index !== timeStr.length - 1) {
        return acc + cur + ':';
      }
      return acc + cur;
    },
    ''
  );
}

class Search {
  result = [];
  source = [];
  commonds = {};

  constructor(data) {
    this.source = data;
    this.result = [];
    this.commonds = {};
  }

  setSource(data) {
    this.source = data;
    this.result = [];
  }

  registerCommand(command, fn) {
    this.commonds[command] = fn;
    return this;
  }

  unregisterCommand(command) {
    delete this.commonds[command];
    return this;
  }

  start() {
    this.result = [];
    return this;
  }

  do(command, searchParams) {
    const currentResult = this.result;
    const currentMethod = this.commonds[command] || (data => data);
    this.result = [
      ...currentResult,
      ...currentMethod(this.source, searchParams)
    ];
    return this;
  }

  listrecord(opt) {
    this.finished = true;
    let res = this.result;

    const { all, plateNum, start, end } = opt;
    if (all) return res;
    return [];
  }
}

class SearchStrategy {
  constructor() {
    this.searchFn = new Map();
    this.validators = new Map();
  }

  add(strategyName, validator, searchFn) {
    this.searchFn.set(strategyName, searchFn);
    this.validators.set(strategyName, validator);
    return this;
  }

  exec(strategyName, value, source) {
    const fn = this.searchFn.get(strategyName) || (data => data);
    const validator = this.validators.get(strategyName) || (() => true);

    if (!validator(value)) {
      throw new Error(`validate ${strategyName} fail, ${value} is invalidate`);
    }
    return fn(source, value);
  }
}

const strategy = new SearchStrategy();
strategy
  .add(
    'plateNum',
    plateNum => true,
    (data, plateNum) => data.filter(item => item.plateNum === plateNum)
  )
  .add(
    'time',
    time => {
      return time.length === 6 || /^\d+$/.test(time);
    },
    (data, time) => data.filter(item => item.time === formateTime(time))
  );

function checkFilter(arr, state, opt) {
  let res = arr.filter(item => item.state === state);

  Object.keys(opt).forEach(key => {
    const value = opt[key];
    if (typeof value !== 'undefined') {
      res = strategy.exec(key, value, res);
    }
  });

  return res;
}

const searcher = new Search(data);
searcher
  .registerCommand('checkin', (data, opt) => {
    return checkFilter(data, 'in', opt);
  })
  .registerCommand('checkout', (data, opt) => {
    return checkFilter(data, 'out', opt);
  });

searcher
  .start()
  .do('checkin', { plateNum: 'AT1234', time: '122321' })
  .do('checkout', { plateNum: 'AT1234', time: '155610' })
  .listrecord({ all: true })
  .forEach(item => {
    console.log(item);
  });
