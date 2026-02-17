import { useForm } from "react-hook-form"
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/packages/ui"

interface ProfileValues {
  nickname: string
}

export function FormStateDemo() {
  const form = useForm<ProfileValues>({
    defaultValues: {
      nickname: "",
    },
    mode: "onChange",
  })

  return (
    <Form {...form}>
      <form className="grid w-full max-w-md gap-4" onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="nickname"
          rules={{
            required: "请输入昵称",
            validate: (value) => value.trim().length >= 2 || "昵称至少 2 个字符",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>昵称</FormLabel>
              <FormControl>
                <Input placeholder="请输入昵称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={!form.formState.isValid}>
            提交
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            重置
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default FormStateDemo
