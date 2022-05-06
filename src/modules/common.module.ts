import { Global, Module } from "@nestjs/common";
import { CommonService } from "src/common/common.service";

@Global()
@Module({
    providers: [CommonService],
    exports: [CommonService]
})
export class CommonModule { }