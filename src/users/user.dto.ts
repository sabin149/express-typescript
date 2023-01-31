import { IsOptional, IsString } from "class-validator";
import CreateAddressDto from "./address.dto";

class CreateUserDto {
  @IsString()
  public name: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;

  @IsOptional()
  public address: CreateAddressDto;
}

export default CreateUserDto;
