import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { usersApi, rolesApi } from "@/lib/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { UserPlus, Mail, Phone, Shield, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Users() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: usersApi.list,
  });

  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: rolesApi.list });

  const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    mobile: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "admin"]),
  });

  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "user",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await usersApi.create(values);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Success", description: "User created successfully" });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create user",
        variant: "destructive" 
      });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-zinc-500 animate-pulse">Loading users...</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1e] min-h-screen text-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
          <p className="text-sm text-zinc-500">Manage SOC analysts and administrators</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#161e31] border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <p className="text-sm text-zinc-500">Enter user details to create a new SOC account.</p>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0a0f1e] border-zinc-800" placeholder="John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="bg-[#0a0f1e] border-zinc-800" placeholder="john@aurisiem.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0a0f1e] border-zinc-800" placeholder="+1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" className="bg-[#0a0f1e] border-zinc-800" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#0a0f1e] border-zinc-800">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#161e31] border-zinc-800 text-zinc-100">
                          {roles?.map((r: any) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-[#111827] border border-zinc-800/50 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#161e31]/50">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-cyan-400 font-bold text-xs uppercase py-4">Name</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase">Email</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase">Mobile</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => {
              const id = user._id ?? user.id;
              return (
                <TableRow key={id} className="border-zinc-800/50 hover:bg-[#161e31]/30 transition-colors">
                  <TableCell className="py-4 font-medium text-zinc-200">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-zinc-500" />
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {user.email || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {user.mobile || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-cyan-500" />
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
