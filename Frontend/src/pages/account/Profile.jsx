import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Camera, Check, Loader2 } from "lucide-react";
import axios from "axios";
import AccountShell from "@/components/Layout/AccountShell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition, Stagger, StaggerItem } from "@/components/ui/Motion";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const inputClass =
  "h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:border-red-500 focus-visible:ring-red-500/20";

const primaryBtn =
  "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export default function Profile() {
  const { user, refresh } = useAuth();
  const fileInputRef = useRef(null);

  const initials =
    `${(user?.firstname || "").charAt(0)}${(user?.lastname || "").charAt(0)}`.toUpperCase() ||
    "U";

  const [form, setForm] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    number: user?.number || "",
    gender: user?.gender || "",
    city: user?.city || "",
  });
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      number: user?.number || "",
      gender: user?.gender || "",
      city: user?.city || "",
    });
  }, [user]);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (form.number && !/^\d{10}$/.test(form.number.trim())) {
      setError("Phone must be a 10-digit number");
      return;
    }

    setSaving(true);
    try {
      await api.patch("/users/me", {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        number: form.number.trim(),
        gender: form.gender,
        city: form.city.trim(),
      });
      toast.success("Profile updated");
      await refresh();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not update profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const triggerFile = () => fileInputRef.current?.click();

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Only PNG, JPEG, or WEBP images are supported");
      return;
    }

    setUploadingAvatar(true);
    try {
      const presignRes = await api.post("/uploads/presign", {
        kind: "general",
        contentType: file.type,
        filename: file.name,
      });
      const { uploadUrl, publicUrl } = presignRes.data?.data || {};
      if (!uploadUrl || !publicUrl) {
        throw new Error("Could not get upload URL");
      }

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      await api.patch("/users/me", { avatar: publicUrl });
      toast.success("Avatar updated");
      await refresh();
    } catch (err) {
      const msg = err.response?.data?.message || "Avatar upload failed";
      toast.error(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <PageTransition>
      <AccountShell>
        <form onSubmit={handleSave}>
          <Stagger gap={0.07} className="space-y-6">
            {/* Avatar block */}
            <StaggerItem>
              <div className="flex items-center gap-5 pb-6 border-b border-slate-200">
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={triggerFile}
                    disabled={uploadingAvatar}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    aria-label="Change avatar"
                    className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-lg shadow-slate-200"
                      />
                    ) : (
                      <div className="grid place-items-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg text-white text-2xl font-semibold">
                        {initials}
                      </div>
                    )}
                  </motion.button>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/60 pointer-events-none">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 truncate">
                    {user?.firstname || "—"} {user?.lastname || ""}
                  </h2>
                  <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                  <button
                    type="button"
                    onClick={triggerFile}
                    disabled={uploadingAvatar}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 text-xs font-medium transition-colors disabled:opacity-60"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Change avatar
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                  <p className="mt-2 text-[11px] text-slate-500">
                    PNG, JPEG, or WEBP • max 2MB
                  </p>
                </div>
              </div>
            </StaggerItem>

            {error && (
              <StaggerItem>
                <div className="text-rose-700 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                  {error}
                </div>
              </StaggerItem>
            )}

            <StaggerItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-firstname"
                    className="text-slate-800 text-sm font-medium"
                  >
                    First name
                  </Label>
                  <Input
                    id="profile-firstname"
                    name="firstname"
                    value={form.firstname}
                    onChange={onChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-lastname"
                    className="text-slate-800 text-sm font-medium"
                  >
                    Last name
                  </Label>
                  <Input
                    id="profile-lastname"
                    name="lastname"
                    value={form.lastname}
                    onChange={onChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <Label
                  htmlFor="profile-email"
                  className="text-slate-800 text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  id="profile-email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                  aria-describedby="profile-email-note"
                  className={`${inputClass} opacity-80 cursor-not-allowed`}
                />
                <p
                  id="profile-email-note"
                  className="text-xs text-slate-500"
                >
                  Email cannot be changed — contact support.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-number"
                    className="text-slate-800 text-sm font-medium"
                  >
                    Phone
                  </Label>
                  <Input
                    id="profile-number"
                    name="number"
                    type="tel"
                    inputMode="numeric"
                    value={form.number}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        number: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    placeholder="10-digit phone"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-gender"
                    className="text-slate-800 text-sm font-medium"
                  >
                    Gender
                  </Label>
                  <select
                    id="profile-gender"
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                    className={`${inputClass} w-full rounded-md px-3`}
                  >
                    <option value="" className="bg-white">
                      Select…
                    </option>
                    <option value="male" className="bg-white">
                      Male
                    </option>
                    <option value="female" className="bg-white">
                      Female
                    </option>
                    <option value="other" className="bg-white">
                      Other
                    </option>
                  </select>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <Label
                  htmlFor="profile-city"
                  className="text-slate-800 text-sm font-medium"
                >
                  City
                </Label>
                <Input
                  id="profile-city"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  className={inputClass}
                />
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={saving || savedFlash}
                  className={`h-11 px-6 min-w-[160px] ${primaryBtn}`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {saving ? (
                      <motion.span
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </motion.span>
                    ) : savedFlash ? (
                      <motion.span
                        key="saved"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 420, damping: 24 }}
                        className="inline-flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Saved
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Save changes
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </StaggerItem>
          </Stagger>
        </form>
      </AccountShell>
    </PageTransition>
  );
}
