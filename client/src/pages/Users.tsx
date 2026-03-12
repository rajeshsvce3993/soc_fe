import { useQuery, useMutation } from "@tanstack/react-query";
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
  TableRow,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import {
  UserPlus,
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  Pencil,
  UserX,
  UserCheck,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]),
});

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  mobile: z.string().optional(),
  role: z.enum(["user", "admin"]),
  team: z.string().optional(),
});

export default function Users() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<any>(null);
  const [activateOpen, setActivateOpen] = useState(false);
  const [userToActivate, setUserToActivate] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: usersApi.list,
  });

  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: rolesApi.list });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    let list = users;
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          (u.name ?? "").toLowerCase().includes(term) ||
          (u.email ?? "").toLowerCase().includes(term)
      );
    }
    if (roleFilter && roleFilter !== "all") {
      list = list.filter((u) => (u.role ?? "").toLowerCase() === roleFilter.toLowerCase());
    }
    return list;
  }, [users, search, roleFilter]);

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

  const editForm = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      role: "user",
      team: "",
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
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      return usersApi.update(id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Success", description: "User updated successfully" });
      setEditOpen(false);
      setEditingUser(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Success", description: "User deactivated successfully" });
      setDeactivateOpen(false);
      setUserToDeactivate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate user",
        variant: "destructive",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Success", description: "User activated successfully" });
      setActivateOpen(false);
      setUserToActivate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate user",
        variant: "destructive",
      });
    },
  });

  function openEditDialog(user: any) {
    setEditingUser(user);
    editForm.reset({
      name: user.name ?? "",
      email: user.email ?? "",
      mobile: user.mobile ?? "",
      role: (user.role ?? "user") === "admin" ? "admin" : "user",
      team: user.team ?? "",
    });
    setEditOpen(true);
  }

  function openDeactivateDialog(user: any) {
    setUserToDeactivate(user);
    setDeactivateOpen(true);
  }

  function openActivateDialog(user: any) {
    setUserToActivate(user);
    setActivateOpen(true);
  }

  function isCurrentUser(user: any) {
    if (!currentUser) return false;
    const id = user._id ?? user.id;
    const currentId = (currentUser as any).id ?? (currentUser as any)._id;
    if (id != null && currentId != null && String(id) === String(currentId)) return true;
    if ((user.email ?? "").toLowerCase() === (currentUser.email ?? "").toLowerCase()) return true;
    return false;
  }

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
              <form
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-[#0a0f1e] border-zinc-800"
                          placeholder="John Doe"
                        />
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
                        <Input
                          {...field}
                          type="email"
                          className="bg-[#0a0f1e] border-zinc-800"
                          placeholder="john@aurisiem.com"
                        />
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
                        <Input
                          {...field}
                          className="bg-[#0a0f1e] border-zinc-800"
                          placeholder="10 digits"
                        />
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
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and role filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            className="bg-[#161e31] border-zinc-800 pl-9 text-zinc-100 placeholder:text-zinc-500"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] bg-[#161e31] border-zinc-800 text-zinc-100">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent className="bg-[#161e31] border-zinc-800 text-zinc-100">
            <SelectItem value="all">All roles</SelectItem>
            {roles?.map((r: any) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-[#111827] border border-zinc-800/50 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#161e31]/50">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-cyan-400 font-bold text-xs uppercase py-4">Name</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase">Email</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase">Mobile</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase">Role</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase">Status</TableHead>
              <TableHead className="text-cyan-400 font-bold text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => {
              const id = user._id ?? user.id;
              const status = (user.status ?? (user.active === false ? "inactive" : "active")) as string;
              const isInactive = status === "inactive";
              const isSelf = isCurrentUser(user);
              return (
                <TableRow
                  key={id}
                  className={`border-zinc-800/50 transition-colors ${
                    isInactive
                      ? "bg-zinc-900/50 opacity-75 hover:bg-zinc-800/50"
                      : "hover:bg-[#161e31]/30"
                  }`}
                >
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
                  <TableCell>
                    {isInactive ? (
                      <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                        Inactive
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => openEditDialog(user)}
                        title="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {isInactive ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => openActivateDialog(user)}
                          title="Activate user"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 disabled:pointer-events-none"
                          onClick={() => openDeactivateDialog(user)}
                          disabled={isSelf}
                          title={isSelf ? "You cannot deactivate your own account" : "Deactivate user"}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredUsers?.length === 0 && (
          <div className="py-12 text-center text-zinc-500 text-sm">
            {users?.length === 0 ? "No users found." : "No users match your search or filter."}
          </div>
        )}
      </div>

      {/* Edit user dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#161e31] border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <p className="text-sm text-zinc-500">Update user details. Changes save on confirmation.</p>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) => {
                if (!editingUser) return;
                const id = editingUser._id ?? editingUser.id;
                updateMutation.mutate({
                  id: String(id),
                  values: {
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile || undefined,
                    role: data.role,
                    team: data.team || undefined,
                  },
                });
              })}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#0a0f1e] border-zinc-800"
                        placeholder="John Doe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="bg-[#0a0f1e] border-zinc-800"
                        placeholder="john@aurisiem.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#0a0f1e] border-zinc-800"
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#0a0f1e] border-zinc-800">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#161e31] border-zinc-800 text-zinc-100">
                        {roles?.map((r: any) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#0a0f1e] border-zinc-800"
                        placeholder="e.g. SOC L1, Threat Hunting"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent className="bg-[#161e31] border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDeactivate ? (
                <>
                  This will deactivate <strong className="text-zinc-200">{userToDeactivate.name}</strong> (
                  {userToDeactivate.email}). They will no longer be able to sign in. You can reactivate
                  them later if needed. Past activity remains in the audit history.
                </>
              ) : (
                "This will deactivate the user. They will no longer be able to sign in."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDeactivate) {
                  const id = userToDeactivate._id ?? userToDeactivate.id;
                  deactivateMutation.mutate(String(id));
                }
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white"
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate confirmation */}
      <AlertDialog open={activateOpen} onOpenChange={setActivateOpen}>
        <AlertDialogContent className="bg-[#161e31] border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Activate user?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToActivate ? (
                <>
                  This will activate <strong className="text-zinc-200">{userToActivate.name}</strong> (
                  {userToActivate.email}). They will be able to sign in again.
                </>
              ) : (
                "This will activate the user. They will be able to sign in again."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToActivate) {
                  const id = userToActivate._id ?? userToActivate.id;
                  activateMutation.mutate(String(id));
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={activateMutation.isPending}
            >
              {activateMutation.isPending ? "Activating..." : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
