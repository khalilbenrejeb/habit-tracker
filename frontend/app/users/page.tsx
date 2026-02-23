'use client'
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  plan?: string | null;
  logins?: number | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    fetch("http://localhost:3001/api/users")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: any) => setUsers(Array.isArray(data) ? data as User[] : []))
      .catch((err) => {
        console.error("Failed fetching users:", err);
        setUsers([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />
      <div className="pl-64">
        <main className="p-8">
          <h1 className="mb-8 text-2xl font-semibold">Users</h1>

          <Card className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-sm text-gray-600 dark:text-gray-400">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Logins</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="p-4 text-gray-900 dark:text-white">
                        {`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—"}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{user.email ?? "—"}</td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            (user.plan ?? "Free") === "Paid"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {user.plan ?? "Free"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 dark:text-white">{user.logins ?? 0}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-600 dark:text-gray-400">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 