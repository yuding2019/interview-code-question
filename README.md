题的大意是这样的：

停车场会记录车辆的相关使用信息（车牌、进入时间、出去时间等），实现一个程序
允许执行下列命令进行搜索

1. checkin -n=AT1234 -t=123030
2. checkout -n=AT1234 -t=125959
3. listrecord -all

命令3后输出搜索到的列表


> 主要考验整体的设计以及相关思想
>
> 这一面挂了，我基本上是用的函数和ifelse完成的，总结一下，重新实现

1. 实现`Search`类，用于管理数据、中间搜索结果、搜索命令方法以及输出结果

```typescript
class Search<T> {
  source: T[];
  result: T[];
  commands: Record<string, F extends Function>;

  // 更新数据
  setSource(data: T): void;
  // 开启一轮新的搜索
  start(): Search;

  // 注册/注销 命令，命令执行的操作由外部实现
  registerCommand(command: string, fn: Function): Search;
  unregisterCommand(command: string, fn: Function): Search;

  // 执行
  do(command: string, searchParams: object): Search;

  // 获取结果
  listrecord(opt: object): T[];
}
```

```js
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
```

2. 实现`SearchStrategy`类，统一管理校验和搜索方法的执行

```typescript
class SearchStrategy {
  searchFn: Record<string, F extends Function>;
  validators: Record<string, F extends () => boolean>;

  add(strategyName: string, validator: () => boolean, searchFn: Function): SearchStrategy;

  exec(strategyName: string, value: unknown, source: unknown): any
}
```

```js
const strategy = new SearchStrategy();
strategy
  .add(
    'time',
    time => {
      return time.length === 6 || /^\d+$/.test(time);
    },
    (data, time) => data.filter(item => item.time === formateTime(time))
  );

const res = strategy.exec('time', '123030', data);
```
