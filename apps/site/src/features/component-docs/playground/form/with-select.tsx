import { useForm } from "react-hook-form"
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/packages/ui"

interface DeployValues {
  env: string
}

export function FormWithSelectDemo() {
  const form = useForm<DeployValues>({
    defaultValues: {
      env: "test",
    },
  })

  return (
    <Form {...form}>
      <form className="grid w-full max-w-md gap-4" onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="env"
          rules={{ required: "请选择环境" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>部署环境</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择环境" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="test">Testing</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">保存</Button>
      </form>
    </Form>
  )
}

export default FormWithSelectDemo
