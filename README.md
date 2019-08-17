# Geek's Log

Blog platform for geeks.

See `@geeks-log/ui` storybook: https://seokju-na.github.io/geeks-log

**In-Development**

## 저자의 생각

### services/backend

![아키텍처](https://user-images.githubusercontent.com/13250888/62832512-9abacf00-bc6a-11e9-845c-43c08ac6d5a6.png)

- 전체적인 아키텍처는 [Clear Architecture](https://github.com/jkphl/clear-architecture)을 따르고 있습니다.
- [CQRS](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)과 [Event-Sourcing](https://docs.microsoft.com/ko-kr/azure/architecture/patterns/event-sourcing) 패턴을 구현합니다.
- 사용할 프레임워크, Infra System은 아래와 같습니다.
  * [NestJS](https://nestjs.com)
  * [Greg Young's Eventstore](https://eventstore.org/)
  * Redis cache
  * AWS S3
  * Cloudfront

### Domain 영역
- Command, Event 를 정의합니다.
- Command가 어떻게 이벤트를 생산하는지 정의합니다.
- 엔티티의 최종 상태는 이벤트를 reduce 하여 구할 수 있습니다.

#### Application 영역
- Command Handler, Query Handler, Saga 를 정의합니다.
- Infrastructure로부터 서비스를 주입받아 사용 가능합니다. `geeks-log backend` 에서는 NestJS 프레임워크의 DI를 이용하여 서비스를 주입 받습니다.
    ```typescript
    import { Injectable } from '@nestjs/common';
    import { ModuleRef } from '@nestjs/core';
    
    @Injectable()
    class SomeAppService {
      private readonly someServiceFromInfra: any;
    
      constructor(private readonly ref: ModuleRef) {
        this.someServiceFromInfra = this.ref.get('TOKEN', { strict: false });
      }
    }
    ```

#### Infrastructure
- 타 플랫폼 의존적인 구현을 포함합니다. 예를 들어 Eventstore, Database(MySQL, MongoDB, ...), Cache(Redis, ...), Storage(AWSS3, ...) 등이 포함됩니다.

#### Ports
- 사용자가 접근가능한 퍼블릭 인터페이스를 제공합니다. 

## License

MIT-Licensed
