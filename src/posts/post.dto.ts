import { IsString, IS_EMPTY } from "class-validator";

class CreatePostDto {
  @IsString()
  public content: string;

  @IsString()
  public title: string;
}

export default CreatePostDto;
