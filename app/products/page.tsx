"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertTriangle, Check, Download, Filter, MoreHorizontal, Package, Plus, Search, X } from "lucide-react"
import { AddProductDialog } from "@/components/products/add-product-dialog"
import { EditProductDialog } from "@/components/products/edit-product-dialog"
import { DeleteProductDialog } from "@/components/products/delete-product-dialog"

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // Fetch products
      const { data, error } = await supabase
        .from("medicines")
        .select(`
          *,
          medicine_categories(id, name)
        `)
        .order("name", { ascending: true })

      if (error) throw error

      // Fetch categories for category cards
      const { data: categoriesData, error: categoriesError } = await supabase.from("medicine_categories").select("*")

      if (categoriesError) throw categoriesError

      // Calculate stats
      const totalProducts = data?.length || 0
      const lowStockItems = data?.filter((p) => p.stock_quantity <= p.reorder_level).length || 0
      const outOfStock = data?.filter((p) => p.stock_quantity === 0).length || 0

      // Process category data with product counts
      const processedCategories =
        categoriesData?.map((category) => {
          const productsInCategory = data?.filter((p) => p.category_id === category.id) || []
          return {
            ...category,
            productCount: productsInCategory.length,
            trend: Math.random() > 0.5 ? Math.random() * 5 : -Math.random() * 5, // Mock trend data
          }
        }) || []

      setProducts(data || [])
      setCategories(processedCategories)
      setStats({
        totalProducts,
        lowStockItems,
        outOfStock,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProduct = async (productData: any) => {
    try {
      const { error } = await supabase.from("medicines").insert(productData)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async (productData: any) => {
    try {
      const { error } = await supabase.from("medicines").update(productData).eq("id", productData.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product updated successfully",
      })

      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("medicines").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleViewProductSales = (product: any) => {
    // Navigate to sales page with product filter
    window.location.href = `/sales?product=${product.id}`
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.medicine_categories?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout title="Product List" subtitle="Let's check your pharmacy today" onRefresh={fetchProducts}>
      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <div className="rounded-full bg-[#004d40]/10 p-2">
                <Package className="h-4 w-4 text-[#004d40]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <div className="rounded-full bg-yellow-100 p-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <div className="rounded-full bg-red-100 p-2">
                <X className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.outOfStock}</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Card
              key={category.id}
              className={`bg-white ${category.name === "Antibiotics" ? "border-l-4 border-l-[#004d40]" : ""}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{category.productCount}</div>
                <div className="flex items-center text-xs">
                  <span className={`flex items-center ${category.trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {category.trend >= 0 ? <Check className="mr-1 h-3 w-3" /> : <X className="mr-1 h-3 w-3" />}
                    {Math.abs(category.trend).toFixed(1)}%
                  </span>
                  <span className="ml-1 text-muted-foreground">Since last week</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Products Table */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1 bg-[#004d40] hover:bg-[#00695c]"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Product</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">#{product.sku || product.id.slice(0, 4)}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.stock_quantity} units</TableCell>
                    <TableCell>${product.unit_price.toFixed(2)}</TableCell>
                    <TableCell>{new Date(product.expiry_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          product.stock_quantity === 0
                            ? "bg-red-100 text-red-700"
                            : product.stock_quantity <= product.reorder_level
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.stock_quantity === 0
                          ? "Out of stock"
                          : product.stock_quantity <= product.reorder_level
                            ? "Low stock"
                            : "In stock"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewProductSales(product)}>
                            View Sales
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
        onSubmit={handleAddProduct}
      />

      {selectedProduct && (
        <>
          <EditProductDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            product={selectedProduct}
            categories={categories}
            onSubmit={handleEditProduct}
          />

          <DeleteProductDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            product={selectedProduct}
            onDelete={() => handleDeleteProduct(selectedProduct.id)}
          />
        </>
      )}
    </DashboardLayout>
  )
}
