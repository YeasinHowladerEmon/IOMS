"use client";

import { useState } from "react";
import { 
  useCategoriesQuery, 
  useCreateCategoryMutation, 
  useDeleteCategoryMutation,
  type CreateCategoryPayload 
} from "@/lib/categories";
import { motion, AnimatePresence } from "framer-motion";
import { useOverlay } from "@/lib/overlay-context";
import type { Variants } from "framer-motion";
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, THead, TBody, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const INDIGO = "oklch(0.68 0.24 262)";
const CYAN   = "oklch(0.78 0.18 205)";


export default function CategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useCategoriesQuery();
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategoryMutation();
  const { mutateAsync: deleteCategory } = useDeleteCategoryMutation();
  const { showAlert } = useOverlay();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState<CreateCategoryPayload>({ name: "", description: "" });
  const [search, setSearch] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(newCat);
      setShowAddModal(false);
      setNewCat({ name: "", description: "" });
    } catch (e) {
      // Error is handled by UI/Toast
    }
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      className="space-y-7" 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-lg text-muted-foreground mt-1">Manage your product categorization</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      <div className="relative max-w-md">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="pl-11"
        />
        <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
      </div>

      {error && (
        <Card className="border-destructive/20 bg-destructive/10 text-destructive p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-semibold">{(error as Error).message}</p>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-auto underline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground font-medium">Loading categories…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FolderOpen className="w-16 h-16 opacity-20" />
            <p className="text-xl font-bold text-foreground">No categories found</p>
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Description</TH>
                <TH>Date Created</TH>
                <TH className="text-right"></TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((cat) => (
                <TR key={cat.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-base font-bold text-foreground">{cat.name}</span>
                    </div>
                  </TD>
                  <TD className="text-muted-foreground">{cat.description}</TD>
                  <TD className="text-sm text-muted-foreground">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </TD>
                  <TD className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => showAlert({
                        title: "Delete Category?",
                        message: `Are you sure you want to delete "${cat.name}"? This will affect all associated products.`,
                        confirmText: "Delete",
                        cancelText: "Cancel",
                        type: "danger",
                        onConfirm: () => deleteCategory(cat.id)
                      })}
                      className="hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Category"
        description="Create a new classification for your stock."
      >
        <form onSubmit={handleAdd} className="space-y-5">
          <Input
            label="Category Name"
            placeholder="e.g. Electronics"
            required
            value={newCat.name}
            onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
          />
          <Textarea
            label="Description"
            placeholder="Optional details..."
            value={newCat.description}
            onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
          />
          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isCreating}
          >
            Create Category
          </Button>
        </form>
      </Modal>
    </motion.div>
  );
}
