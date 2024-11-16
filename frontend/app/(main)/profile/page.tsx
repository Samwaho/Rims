import { requireAuth } from "@/lib/actions";
import {
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
} from "react-icons/io5";

interface Address {
  street?: string;
  city?: string;
  county?: string;
  postalCode?: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: Address;
}

export default async function ProfilePage() {
  const user = (await requireAuth()) as User;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
            <IoPersonOutline className="text-primary" size={28} />
            Profile Information
          </h1>

          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <label className="block text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  First Name
                </label>
                <p className="text-lg sm:text-xl font-medium text-gray-800">
                  {user.firstName}
                </p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <label className="block text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  Last Name
                </label>
                <p className="text-lg sm:text-xl font-medium text-gray-800">
                  {user.lastName}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <label className="block text-sm font-medium text-gray-500 mb-1 sm:mb-2 flex items-center gap-2">
                <IoMailOutline className="text-primary" size={18} />
                Email Address
              </label>
              <p className="text-lg sm:text-xl font-medium text-gray-800 break-all">
                {user.email}
              </p>
            </div>

            {user.phoneNumber && (
              <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <label className="block text-sm font-medium text-gray-500 mb-1 sm:mb-2 flex items-center gap-2">
                  <IoCallOutline className="text-primary" size={18} />
                  Phone Number
                </label>
                <p className="text-lg sm:text-xl font-medium text-gray-800">
                  {user.phoneNumber}
                </p>
              </div>
            )}

            {user.address && (
              <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <label className="block text-sm font-medium text-gray-500 mb-1 sm:mb-2 flex items-center gap-2">
                  <IoLocationOutline className="text-primary" size={18} />
                  Address
                </label>
                <div className="space-y-1 sm:space-y-2">
                  {user.address.street && (
                    <p className="text-lg sm:text-xl font-medium text-gray-800">
                      {user.address.street}
                    </p>
                  )}
                  <p className="text-lg sm:text-xl font-medium text-gray-800">
                    {[
                      user.address.city,
                      user.address.county,
                      user.address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
