"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];
  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

  //setiap lu pake fetch di next / react, lu akan mendapati bahwa data tsb bakal dicache.
  //so whenever you visit that page again, you wont be able to see updated data if thereis any changes.
  //instead, if you wanna check updated page, you have to revalidate the page to purge sek and thats why revalidate is exist

  //aduh ribet jg yak?

  //jadi kata bang nauval pada mediumnya, https://medium.com/kredibel/next-js-pragmatis-data-fetching-4a7a752c1b81
  //revalidate dipake untuk ngevalidate ulang semua fungsi yg ada di path tsb apa aja,
  //jadi kyk ngepurge cache dlu data nya di path tsb, in this case sih ngepurge cache nya dari proses async yg ada di dashboard invoices
  //baru deh diredirect ke page nya dan lakukan fetch ulang krn data nya udah di-purge
  //ada opsi jg smisal gak mau ngefetch ulang smuanya di 1 path, tp cuma bbrp component aja, bisa pake revalidate tag. sumbernya ada di medium bg nauval jg

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");

  // Test it out:
  //   console.log(rawFormData);
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// ...

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}
