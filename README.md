# Simple-Koa

本框架基于 Koa 搭建，拥有完整的 Koa 生态;

# 功能

1.简单且易于使用的 Controller 和 Router

2.强大的依赖注入，支持依赖反转，接口注入等

4.Swagger 文档

5.日志管理

6.QueueManager 支持 MQTT 与 Kafka

7.HttpClient(日程中)

8.Jwt 验证(日程中)

9.数据仓储(日程中)

10.定时任务(日程中)

# 快速开始

#### 定义一个 Controller

```
import Program, {
    Controller,
    Inject,
    Injectable,
    Transient,
    HttpDelete,
    HttpGet,
    HttpPut,
    HttpPost,
    RequestBody,
    RequestQuery,
    Router
} from 'simple-koa';

export interface ITestController {
  GetTest(data: { name: string }): string;
  PostTest(id: string, data: Object): string;
  PutTest(file: ArrayBuffer): string;
  DeleteTest(id: number): string;

  ObjTest(): Test;
}

class Test {
  public name?: string;
  public age?: number;
}

@Transient()
@Injectable()
@Router()
export default class TestController extends Controller implements ITestController {
  constructor(@Inject('ITestService') private testService: ITestService) {
    super();
  }
  @HttpGet()
  ObjTest(): Test {
    throw new Error('Method not implemented.');
  }

  @HttpGet()
  public GetTest(@RequestQuery() data: { name: string }): string {
    if (data.name) return data.name;
    return this.testService.TestService();
  }

  @HttpPost()
  public PostTest(@RequestQuery('id') id: string, @RequestBody() data: Object): string {
    return 'PostTest';
  }

  @HttpPut()
  public PutTest(@RequestBody() file: ArrayBuffer): string {
    return 'PutTest';
  }

  @HttpDelete()
  public DeleteTest(@RequestQuery('id') id: number): string {
    console.log(id);
    return '删除成功';
  }
}

```

#### 发布订阅

##### 配置文件

在配置文件中添加如下配置

```
  "queues": {
    "kafkaTest": {  // 唯一Key
      "type": "kafka", // 消息管道类型(支持kafka和mqtt)
      "options": {
        "servers": "server.dev.ai-care.top:9092", // kafka地址
        "clientId": "koa_kafka_test" // clientId
      }
    },
    "mqttTest": { // 唯一Key
      "type": "mqtt", // 消息管道类型(支持kafka和mqtt)
      "options": {
        "address": "mqtt://192.168.1.82", // mqtt地址
        "clientId": "koa_mqtt_test", // clientId
        "userName": "ronds", // mqtt账号
        "password": "ronds@123" // mqtt密码
      }
    }
  }
```

##### 订阅

在入口文件中重写 StartQueues 函数进行订阅操作

```
class App extends Program {
  override StartQueues() {
    const factory = Container.resolve<IQueueManagerFactory>(QMF_INJECT_TOKEN);

    const kafkaManager = factory.GetQueueManager('kafkaTest');
    const mqttManager = factory.GetQueueManager('mqttTest');

    const mqttTestTopic = GetEventKey(MqttSubTest);
    mqttManager.Subscription(mqttTestTopic, 'simple_koa_test/#');

    const kafkaTestTopic = GetEventKey(KafkaSubTest);
    kafkaManager.Subscription(kafkaTestTopic, kafkaTestTopic);

    super.StartQueues();
  }
}

const app = new App(__dirname);
app.Start();
```

##### 发布

```
import { Inject, Injectable, Singleton } from '../../src/di/Dependency';
import { GetQueueToken, IQueueManager } from '../../src/queue/QueueManager';
import { Service } from '../../src/service/Service';

export interface IQueueTestService {
  PublishAsync(data: any): Promise<void>;
}

@Injectable()
@Singleton('IQueueTestService')
export class QueueTestService extends Service implements IQueueTestService {
  constructor(@Inject(GetQueueToken('mqttTest')) private pubQueueManager: IQueueManager) {
    super();
  }

  async PublishAsync(data: any): Promise<void> {
    await this.pubQueueManager.PublishAsync('simple_koa_test', data);
    await this.pubQueueManager.PublishAsync('simple_koa_test', Buffer.from(JSON.stringify(data), 'utf-8'));
  }
}


```

# 启动

```
import Program from 'simple-koa';

const program = new Program(__dirname);
program.Start();

```

# 访问

http:127.0.0.1:30000(主界面)

http:127.0.0.1:30000/swagger(SwaggerApi)
