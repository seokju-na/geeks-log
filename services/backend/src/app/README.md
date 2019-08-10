# Application area of Geek's Log backend

## Includes
* Command handlers
* Query handlers
* Sagas

## Dependencies
* Don't import infra modules.
* Don't directly use infra services. Instead, get injection from 'moduleRef'.
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
