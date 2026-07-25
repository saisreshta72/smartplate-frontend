"use client"

import React from 'react'
import ImageUploader from "./ImageUploader";
import { useState, useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Plus, Loader2,X ,Check} from "lucide-react";
import { Button } from "./ui/button";
import { scanPantryImage, saveToPantry, addPantryItemManually } from "@/actions/pantry.actions";

const AddToPantryModal = ({ isOpen, onClose, onSuccess }) => {
     const [activeTab, setActiveTab] = useState("scan");
  const [selectedImage, setSelectedImage] = useState(null);
  const [scannedIngredients, setScannedIngredients] = useState([]);
  const [scannedRecipes, setScannedRecipes] = useState([]);
  const [manualItem, setManualItem] = useState({ name: "", quantity: "" });

  // Scan image
  const {
    loading: scanning,
    data: scanData,
    fn: scanImage,
  } = useFetch(scanPantryImage);

  // Update scanned ingredients when scan completes
  useEffect(() => {
    if (scanData?.success && scanData?.ingredients) {
      setScannedIngredients(scanData.ingredients);
      if (scanData.recipes) setScannedRecipes(scanData.recipes);
      toast.success(`Found ${scanData.ingredients.length} ingredients!`);
    }
  }, [scanData]);


  // Save scanned items
  const {
    loading: saving,
    data: saveData,
    fn: saveScannedItems,
  } = useFetch(saveToPantry);

  // Add manual item
  const {
    loading: adding,
    data: addData,
    fn: addManualItem,
  } = useFetch(addPantryItemManually);

    // Handle manual add success
  useEffect(() => {
    if (addData?.success) {
      if (addData.isGuest && addData.item) {
        const saved = JSON.parse(localStorage.getItem("smartplate_local_pantry") || "[]");
        saved.unshift(addData.item);
        localStorage.setItem("smartplate_local_pantry", JSON.stringify(saved));
        window.dispatchEvent(new Event("smartplate_pantry_updated"));
      }
      toast.success(addData.message || "Item added to pantry!");
      setManualItem({ name: "", quantity: "" });
      handleClose();
      if (onSuccess) onSuccess();
    }
  }, [addData]);

    // Reset modal state
  const handleClose = () => {
    setActiveTab("scan");
    setSelectedImage(null);
    setScannedIngredients([]);
    setManualItem({ name: "", quantity: "" });
    onClose();
  };

// Handle image selection
  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setScannedIngredients([]); // Reset when new image selected
  };

  // Handle manual add
  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!manualItem.name.trim() || !manualItem.quantity.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", manualItem.name);
    formData.append("quantity", manualItem.quantity);
    await addManualItem(formData);
  };

   // Scan image
  const handleScan = async () => {
    if (!selectedImage) return;
    const formData = new FormData();
    formData.append("image", selectedImage);
    await scanImage(formData);
  };

  const handleSaveScanned = async () =>{
    if (scannedIngredients.length === 0) {
      toast.error("No ingredients to save");
      return;
    };
    const formData = new FormData();
    formData.append("ingredients", JSON.stringify(scannedIngredients));
    await saveScannedItems(formData);
  };

  // Handle save success
  useEffect(() => {
    if (saveData?.success) {
      if (saveData.isGuest && saveData.savedItems) {
        const saved = JSON.parse(localStorage.getItem("smartplate_local_pantry") || "[]");
        const updated = [...saveData.savedItems, ...saved];
        localStorage.setItem("smartplate_local_pantry", JSON.stringify(updated));
        window.dispatchEvent(new Event("smartplate_pantry_updated"));
      }
      toast.success(saveData.message || "Items saved to pantry!");
      handleClose();
      if (onSuccess) onSuccess();
    }
  }, [saveData]);

const removeIngredient = (index) =>{
  setScannedIngredients(scannedIngredients.filter((_, i) => i !== index));
}

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6">      
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold tracking-tight text-stone-900">
            Add to Pantry 🛒
          </DialogTitle>
          <DialogDescription className="text-stone-500 text-sm font-light">
            Scan your fridge/groceries with AI or enter ingredients manually to get custom recipes!
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-stone-100 rounded-xl">
            <TabsTrigger value="scan" className="gap-2 font-bold text-sm">
              <Camera className="w-4 h-4 text-orange-600" />
              AI Image Scan
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2 font-bold text-sm">
              <Plus className="w-4 h-4 text-orange-600" />
              Add Manually
            </TabsTrigger>
          </TabsList>
           {/* AI Scan Tab */}
          <TabsContent value="scan" className="space-y-6 mt-6">
            {scannedIngredients.length ===0 ? (
              <div className='space-y-4'>
                <div className="bg-orange-50/70 p-3.5 border border-orange-200 rounded-xl text-xs text-orange-900 space-y-1">
                  <span className="font-bold block">📸 How AI Scan Works:</span>
                  <p className="font-light">Snap or upload a photo of your open fridge, pantry shelf, or receipt. Our chef AI will detect all visible ingredients automatically!</p>
                </div>
                 {/*Image Uploader*/}
            <ImageUploader
              onImageSelect ={handleImageSelect}
              loading={scanning}
            />

   {selectedImage && !scanning && (
                  <Button
                    onClick={handleScan}
                    className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={scanning}
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mr-2" />
                        Scan Image
                      </>
                    )}
                  </Button>
                )}

            </div>
          ) :( 
          <div className='space-y-4'>
            <div className="flex items-center justify-between">
         <div>
        <h3 className="text-lg font-bold text-stone-900">
            Review Detected Items
              </h3>
            <p className="text-sm text-stone-600">
            Found {scannedIngredients.length} ingredients
                </p>
            </div>    

          <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScannedIngredients([]);
                      setSelectedImage(null);
                    }}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Again
                  </Button>         
            </div>
     <div className="space-y-3 max-h-96 overflow-y-auto">
       {scannedIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200"
                    >
                      <div className='flex-1'>
                       <div className="font-medium text-stone-900">
                          {ingredient.name}
                        </div>
                        <div className="text-sm text-stone-500">
                          {ingredient.quantity}
                        </div>
                      </div>
   {ingredient.confidence && (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-700 border-green-200"
                        >
                          {Math.round(ingredient.confidence * 100)}%
                        </Badge>
                      )}

       <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeIngredient(index)}
                        className="text-stone-600 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>

                    </div>
       ))}
          </div>

          {/* AI Recipes Generated From Scanned Ingredients */}
          {scannedRecipes.length > 0 && (
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                  🍳 Recipes You Can Cook With These Ingredients:
                </h4>
                <Badge className="bg-orange-600 text-white font-bold text-[10px]">
                  {scannedRecipes.length} AI Recipes
                </Badge>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {scannedRecipes.map((recipe, idx) => (
                  <div key={idx} className="bg-orange-50/70 border border-orange-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-sm text-stone-900">{recipe.title}</h5>
                      <span className="text-[10px] font-bold bg-white text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full shrink-0">
                        {recipe.prepTime}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-light">{recipe.description}</p>
                    
                    {recipe.instructions?.length > 0 && (
                      <div className="text-[11px] text-stone-700 bg-white p-2 rounded-lg border border-orange-100 space-y-1">
                        <span className="font-bold text-orange-900 block">Step-by-Step Cooking Steps:</span>
                        <ol className="list-decimal list-inside space-y-0.5 font-light">
                          {recipe.instructions.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <div className="pt-1">
                      <a
                        href={`/recipe?cook=${encodeURIComponent(recipe.title)}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 underline"
                      >
                        Start Cooking Recipe →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
    {/* Save Button */}
                <Button
                  onClick={handleSaveScanned}
                  disabled={saving || scannedIngredients.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Save {scannedIngredients.length} Items to Pantry
                    </>
                  )}
                </Button>
          </div>
          )}
          </TabsContent>
          <TabsContent value="manual" className="mt-6">
           <form onSubmit={handleAddManual} className="space-y-4">
          <div>
            <label className='block text-sm font-medium text-stone-700 mb-2'>
              Ingredient Name
            </label>
            <input 
            type="text"
            value={manualItem.name}
            onChange={(e)=>
              setManualItem({...manualItem, name:e.target.value})
            }
          placeholder ="e.g., Chicken breast"
       className='w-full px-4 py-3 border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 '
       disabled={adding}
            />        
          </div>

 <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Quantity
                </label>
                <input
                  type="text"
                  value={manualItem.quantity}
                  onChange={(e) =>
                    setManualItem({ ...manualItem, quantity: e.target.value })
                  }
                  placeholder="e.g., 500g, 2 cups, 3 pieces"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={adding}
                />
              </div>

 <Button
                type="submit"
                disabled={adding}
                variant="primary"
               className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Item
                  </>
                )}
              </Button>


           </form>
            </TabsContent>
          </Tabs>
          </DialogContent>
          </Dialog>

  )
}

export default AddToPantryModal
