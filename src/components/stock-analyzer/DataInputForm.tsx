import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { format } from 'date-fns';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldSet, FieldLabel } from "@/components/ui/field"

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "text/csv", 
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel"
];

const formSchema = z.object({
  volumeLookbackDays: z
    .coerce.number({ message: "Days is required and must be a number" })
    .min(0, { message: "Days cannot be negative" })
    .max(100, { message: "Days cannot exceed 100" }),
  priceForwardDays: z
    .coerce.number({ message: "Days is required and must be a number" })
    .min(0, { message: "Days cannot be negative" })
    .max(100, { message: "Days cannot exceed 100" }),
  volumeBinSize: z
    .coerce.number({ message: "Bin size is required and must be a number" })
    .min(0, { message: "Bin size cannot be negative" })
    .max(100, { message: "Bin size cannot exceed 100" }),
  priceReturnBinSize: z
    .coerce.number({ message: "Bin size is required and must be a number" })
    .min(0, { message: "Bin size cannot be negative" })
    .max(100, { message: "Bin size cannot exceed 100" }),
  inputExcelFile: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "File is required")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max size is 5MB")
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .csv, .xls and .xlsx are supported"
    ),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const DataInputForm: React.FC = () => {

  const { 
    register, handleSubmit, reset,
    // setError, // to set server side errors if needed
    formState: { errors, isSubmitting }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<z.input<typeof formSchema>, any, z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      volumeLookbackDays: 30,
      priceForwardDays: 50,
      volumeBinSize: 50,
      priceReturnBinSize: 20,
      inputExcelFile: undefined
    },
  })

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {

    const formData = new FormData();
    formData.append("volumeLookbackDays", data.volumeLookbackDays.toString());
    formData.append("priceForwardDays", data.priceForwardDays.toString());
    formData.append("volumeBinSize", data.volumeBinSize.toString());
    formData.append("priceReturnBinSize", data.priceReturnBinSize.toString());

    if (data.inputExcelFile && data.inputExcelFile[0]) {
      formData.append("inputExcelFile", data.inputExcelFile[0]);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, { method: "POST", body: formData });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const timestamp = format(new Date(), "yyyy-MM-dd 'at' HH.mm.ss");
        a.download = `${data.inputExcelFile[0].name.split('.').slice(0, -1).join('.')}_result_${timestamp}.xlsx`; // Filename
        
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        console.error("Server Error:", errorData.detail);
        toast("Upload Failed:", {
          description: (
            <pre className="bg-code text-slate-700 mt-2 w-[320px] overflow-x-auto rounded-md p-4">
              <code>{JSON.stringify(errorData.detail, null, 2)}</code>
            </pre>
          ),
          position: "bottom-right", classNames: { content: "flex flex-col gap-2" },
          style: { "--border-radius": "calc(var(--radius)  + 4px)" } as React.CSSProperties,
        })
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  }

  return (
    <Card className="w-full sm:max-w-4xl">
      <CardHeader className="border-b">
        <CardTitle className="text-3xl font-bold"> Time-Series Stock Analyzer </CardTitle>
        <CardDescription> Upload stock time-series data and configure statistical windows to derive volume-based signals, forward price returns, and frequency distributions for behavior analysis. </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="dataInputForm" onSubmit={handleSubmit(onSubmit)}>
          <FieldSet className="gap-4">
            <div className="grid grid-cols-2 gap-4">

              <Field>
                <FieldLabel htmlFor="volumeLookbackDays"> Volume Lookback Window (Days) </FieldLabel>
                <FieldDescription> Number of past trading days used to calculate the rolling average volume baseline. </FieldDescription>
                <Input {...register("volumeLookbackDays")} id="volumeLookbackDays" type="number" />
                {errors.volumeLookbackDays && <div className="text-red-500">{errors.volumeLookbackDays.message}</div>}
              </Field>
              <Field>
                <FieldLabel htmlFor="priceForwardDays"> Price Forward Return Window (Days) </FieldLabel>
                <FieldDescription> Number of future trading days used to compute forward price returns for outcome analysis. </FieldDescription>
                <Input {...register("priceForwardDays")} id="priceForwardDays" />
                {errors.priceForwardDays && <div className="text-red-500">{errors.priceForwardDays.message}</div>}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="volumeBinSize"> Volume Percentage Bin Size </FieldLabel>
                <FieldDescription> Interval size (in %) used to group volume deviations from the rolling average into ranges. </FieldDescription>
                <Input {...register("volumeBinSize")} id="volumeBinSize" />
                {errors.volumeBinSize && <div className="text-red-500">{errors.volumeBinSize.message}</div>}
              </Field>
              <Field>
                <FieldLabel htmlFor="priceReturnBinSize"> Price Return Percentage Bin Size </FieldLabel>
                <FieldDescription> Interval size (in %) used to group forward price returns into outcome ranges. </FieldDescription>
                <Input {...register("priceReturnBinSize")} id="priceReturnBinSize" />
                {errors.priceReturnBinSize && <div className="text-red-500">{errors.priceReturnBinSize.message}</div>}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="inputExcelFile"> Input Excel Files </FieldLabel>
              <FieldDescription> One or more Excel files containing time-ordered stock data with time, price, and volume columns. </FieldDescription>
              <Input {...register("inputExcelFile")} id="inputExcelFile" type="file" />
              {errors.inputExcelFile &&typeof errors.inputExcelFile.message === 'string' && <div className="text-red-500">{errors.inputExcelFile.message}</div>}
            </Field>
          </FieldSet>
        </form>
      </CardContent>
      <CardFooter className="border-t">
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => reset()}> Reset </Button>
          <Button disabled={isSubmitting} type="submit" form="dataInputForm">
            {isSubmitting ? "Processing..." : "Upload"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}