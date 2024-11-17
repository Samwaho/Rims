"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/hooks/useUser";
import { CreditCard, Loader2 } from "lucide-react";
import { getAuthUser } from "@/lib/actions";

interface Address {
  street?: string;
  city?: string;
  county?: string;
  postalCode?: string;
}

interface PaymentMethod {
  type: string;
  cardNumber: string;
  expiryDate: string;
  cardHolderName: string;
}

interface PersonalInfoProps {
  user: Partial<User>;
  editMode: boolean;
  onChange: (field: keyof User, value: string) => void;
  isLoading: boolean;
}

interface AddressInfoProps {
  address?: User["address"];
  editMode: boolean;
  onChange: (updates: Partial<User["address"]>) => void;
  isLoading: boolean;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  editMode: boolean;
}

function LoadingProfile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  const { user, isLoading, updateProfile, updateAddress } = useUser();
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await getAuthUser();
        if (!authUser) {
          router.push("/sign-in");
        }
        setIsInitialLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/sign-in");
      }
    };

    checkAuth();
  }, [router]);

  const handleSaveChanges = async () => {
    if (!user || !formData) return;

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || "",
      });
      setEditMode(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      phoneNumber: user?.phoneNumber || "",
    });
    setEditMode(false);
  };

  if (isInitialLoading || isLoading) {
    return <LoadingProfile />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src="/placeholder.svg?height=80&width=80"
                  alt={`${user?.firstName} ${user?.lastName}`}
                />
                <AvatarFallback>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl sm:text-2xl">
                  {formData.firstName} {formData.lastName}
                </CardTitle>
                <CardDescription className="break-all">
                  {formData.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => {
                  if (editMode) {
                    handleSaveChanges();
                  } else {
                    setEditMode(true);
                  }
                }}
                disabled={updateProfile.isPending}
                className="flex-1 sm:flex-none"
              >
                {editMode
                  ? updateProfile.isPending
                    ? "Saving..."
                    : "Save Changes"
                  : "Edit Profile"}
              </Button>
              {editMode && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateProfile.isPending}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfo
                user={formData}
                editMode={editMode}
                onChange={(field, value) =>
                  setFormData((prev) => ({ ...prev, [field]: value }))
                }
                isLoading={updateProfile.isPending}
              />
            </TabsContent>
            <TabsContent value="address">
              <AddressInfo
                address={user.address}
                editMode={editMode}
                onChange={(updates) =>
                  updateAddress.mutate({
                    ...user.address,
                    ...updates,
                  })
                }
                isLoading={updateAddress.isPending}
              />
            </TabsContent>
            <TabsContent value="payment">
              <PaymentMethods
                methods={user.paymentMethods}
                editMode={editMode}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  user,
  editMode,
  onChange,
  isLoading,
}) => {
  const handleChange = (field: keyof User, value: string) => {
    if (field === "email" && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }
    onChange(field, value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={user.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
            disabled={!editMode || isLoading}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={user.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
            disabled={!editMode || isLoading}
            required
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          disabled={!editMode || isLoading}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={user.phoneNumber || ""}
          onChange={(e) => handleChange("phoneNumber", e.target.value)}
          disabled={!editMode || isLoading}
          placeholder="Enter your phone number"
          className="mt-1"
        />
      </div>
    </div>
  );
};

const AddressInfo: React.FC<AddressInfoProps> = ({
  address,
  editMode,
  onChange,
  isLoading,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={address?.street || ""}
          onChange={(e) => onChange({ street: e.target.value })}
          disabled={!editMode || isLoading}
          placeholder="Enter your street address"
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={address?.city || ""}
            onChange={(e) => onChange({ city: e.target.value })}
            disabled={!editMode || isLoading}
            placeholder="Enter your city"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="county">County</Label>
          <Input
            id="county"
            value={address?.county || ""}
            onChange={(e) => onChange({ county: e.target.value })}
            disabled={!editMode || isLoading}
            placeholder="Enter your county"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          value={address?.postalCode || ""}
          onChange={(e) => onChange({ postalCode: e.target.value })}
          disabled={!editMode || isLoading}
          placeholder="Enter your postal code"
          className="mt-1"
        />
      </div>
    </div>
  );
};

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  methods,
  editMode,
}) => {
  const { updatePaymentMethods } = useUser();
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleRemove = async (index: number) => {
    try {
      const updatedMethods = methods.filter((_, i) => i !== index);
      await updatePaymentMethods.mutateAsync(updatedMethods);
      toast.success("Payment method removed");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to remove payment method"
      );
    }
  };

  const handleAddCard = async (cardData: PaymentMethod) => {
    try {
      const updatedMethods = [...methods, cardData];
      await updatePaymentMethods.mutateAsync(updatedMethods);
      setIsAddingCard(false);
      toast.success("Payment method added");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to add payment method"
      );
    }
  };

  if (methods.length === 0 && !isAddingCard) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No payment methods added</p>
        {editMode && (
          <Button onClick={() => setIsAddingCard(true)}>
            Add Payment Method
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {methods.map((method, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border gap-4"
        >
          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium break-all">{method.cardNumber}</p>
              <p className="text-sm text-muted-foreground">
                Expires: {method.expiryDate}
              </p>
            </div>
          </div>
          {editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemove(index)}
              disabled={updatePaymentMethods.isPending}
              className="w-full sm:w-auto"
            >
              {updatePaymentMethods.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing...
                </span>
              ) : (
                "Remove"
              )}
            </Button>
          )}
        </div>
      ))}
      {editMode && !isAddingCard && (
        <Button className="w-full" onClick={() => setIsAddingCard(true)}>
          Add New Payment Method
        </Button>
      )}
      {isAddingCard && (
        <AddPaymentMethodForm
          onSubmit={handleAddCard}
          onCancel={() => setIsAddingCard(false)}
          isLoading={updatePaymentMethods.isPending}
        />
      )}
    </div>
  );
};

interface AddPaymentMethodFormProps {
  onSubmit: (data: PaymentMethod) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<PaymentMethod>({
    type: "credit",
    cardNumber: "",
    expiryDate: "",
    cardHolderName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cardHolderName">Card Holder Name</Label>
        <Input
          id="cardHolderName"
          value={formData.cardHolderName}
          onChange={(e) =>
            setFormData({ ...formData, cardHolderName: e.target.value })
          }
          required
          disabled={isLoading}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          value={formData.cardNumber}
          onChange={(e) =>
            setFormData({ ...formData, cardNumber: e.target.value })
          }
          required
          disabled={isLoading}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="expiryDate">Expiry Date</Label>
        <Input
          id="expiryDate"
          value={formData.expiryDate}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
          placeholder="MM/YY"
          required
          disabled={isLoading}
          className="mt-1"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Adding..." : "Add Card"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
