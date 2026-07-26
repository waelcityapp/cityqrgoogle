const fs = require('fs');
const content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const startMarker = "{/* Quick Action Top Bar for Profile Editing */}";
const endMarker = "{/* 📬 PERSONAL MEMBER NOTIFICATIONS INBOX (صندوق إشعارات الحساب الشخصي الموجهة حسب الفئة) */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found');
  process.exit(1);
}

const replacement = `          {/* Main User Profile Card - REBUILT */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37]/50 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 sm:p-8 shadow-2xl space-y-8">
            <div className="absolute top-0 left-0 w-full h-1 animated-glow-line"></div>
            
            {/* UPPER SECTION: Avatar, Info, & Big Action Buttons side by side */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-zinc-800/80 pb-8">
              
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-full border-4 border-[#D4AF37] p-1 bg-gradient-to-tr from-[#D4AF37] via-amber-500 to-[#8B0000] shadow-[0_0_30px_rgba(212,175,55,0.4)] overflow-hidden">
                    <img
                      src={currentUser.avatarUrl || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${encodeURIComponent(currentUser.email || currentUser.fullName || 'user')}\`}
                      alt={currentUser.fullName || 'User Avatar'}
                      className="w-full h-full rounded-full object-cover bg-zinc-900"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="text-center sm:text-start space-y-3">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-[#D4AF37] text-zinc-950 border-[#D4AF37] shadow-lg">
                      {currentUser.role === 'merchant' || currentUser.role === 'admin'
                        ? (language === 'ar' ? 'حساب تاجر / شريك تجاري' : 'MERCHANT PARTNER')
                        : (language === 'ar' ? 'حساب عميل / مستخدم' : 'CUSTOMER USER')}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono font-bold bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                      ID: {currentUser.id.substring(0, 8)}...
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {currentUser.fullName || currentUser.email.split('@')[0]}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-mono text-zinc-300">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#D4AF37]" />
                      <span>{currentUser.email}</span>
                    </span>
                    {currentUser.phoneNumber && (
                      <span className="flex items-center gap-2 text-amber-300">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span>{currentUser.phoneNumber}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: Edit Profile & Sign Out - Very Prominent */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className={\`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-black text-sm transition-all duration-300 shadow-xl cursor-pointer border-2 \${
                    isEditingProfile 
                      ? 'bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 hover:border-zinc-500' 
                      : 'bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black border-[#D4AF37] hover:scale-105'
                  }\`}
                >
                  <Edit3 className="w-5 h-5 stroke-[2.5]" />
                  <span>{isEditingProfile ? (language === 'ar' ? 'إلغاء التعديل ✖' : 'Cancel Edit ✖') : (language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile')}</span>
                </button>
                <button
                  onClick={logoutUser}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border-2 border-red-500/40 hover:border-red-500 font-black text-sm transition-all duration-300 shadow-xl cursor-pointer"
                >
                  <LogOut className="w-5 h-5 stroke-[2.5]" />
                  <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              </div>

            </div>

            {profileSuccessMsg && (
              <div className="p-5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 text-sm font-black flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fade-in">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* PROFILE EDITOR PANEL */}
            {isEditingProfile && (
              <div className="p-6 sm:p-8 rounded-3xl border-2 border-[#D4AF37]/50 bg-zinc-950 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] animate-fade-in space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                  <h3 className="text-xl font-black text-[#D4AF37] flex items-center gap-3">
                    <Edit3 className="w-6 h-6" />
                    <span>{language === 'ar' ? 'تعديل بيانات الحساب' : 'Edit Account Details'}</span>
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono border border-amber-500/30">
                    {language === 'ar' ? 'تحديث البيانات' : 'Update Profile'}
                  </span>
                </div>
                
                <form onSubmit={handleSaveProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="space-y-3">
                      <label className="text-sm font-black text-zinc-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}</span>
                      </label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل...' : 'Enter your full name...'}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white text-sm outline-none focus:border-[#D4AF37] transition font-bold shadow-inner"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-black text-zinc-200 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}</span>
                      </label>
                      <input
                        type="tel"
                        value={editPhoneNumber}
                        onChange={(e) => setEditPhoneNumber(e.target.value)}
                        placeholder={language === 'ar' ? '+201xxxxxxxxx...' : 'Enter phone number...'}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white text-sm outline-none focus:border-[#D4AF37] transition font-bold font-mono shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-zinc-200 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#D4AF37]" />
                      <span>{language === 'ar' ? 'صورة الحساب (Avatar URL):' : 'Avatar URL:'}</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="url"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder={language === 'ar' ? 'أو ألصق رابط صورة هنا...' : 'Or paste image URL here...'}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white text-sm outline-none focus:border-[#D4AF37] transition font-mono shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const demoPhotos = [
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
                          ];
                          setEditAvatarUrl(demoPhotos[Math.floor(Math.random() * demoPhotos.length)]);
                        }}
                        className="px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-black text-sm whitespace-nowrap cursor-pointer transition flex items-center justify-center gap-2 shrink-0 border-2 border-zinc-700 hover:border-zinc-500 shadow-lg"
                      >
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'صورة عشوائية' : 'Random Photo'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800 space-y-5">
                    <label className="text-sm font-black text-[#D4AF37] flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      <span>{language === 'ar' ? 'تفضيلات التواصل والإشعارات:' : 'Contact Preferences:'}</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-900 cursor-pointer hover:border-[#D4AF37] transition group shadow-inner">
                        <input
                          type="checkbox"
                          checked={editContactPreferences.email}
                          onChange={(e) => setEditContactPreferences({ ...editContactPreferences, email: e.target.checked })}
                          className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        <span className="text-sm font-black text-zinc-300 group-hover:text-white">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </span>
                      </label>
                      <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-900 cursor-pointer hover:border-[#D4AF37] transition group shadow-inner">
                        <input
                          type="checkbox"
                          checked={editContactPreferences.sms}
                          onChange={(e) => setEditContactPreferences({ ...editContactPreferences, sms: e.target.checked })}
                          className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        <span className="text-sm font-black text-zinc-300 group-hover:text-white">
                          {language === 'ar' ? 'رسائل SMS' : 'SMS'}
                        </span>
                      </label>
                      <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-900 cursor-pointer hover:border-[#D4AF37] transition group shadow-inner">
                        <input
                          type="checkbox"
                          checked={editContactPreferences.whatsapp}
                          onChange={(e) => setEditContactPreferences({ ...editContactPreferences, whatsapp: e.target.checked })}
                          className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        <span className="text-sm font-black text-zinc-300 group-hover:text-white">
                          {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-black text-sm transition cursor-pointer border-2 border-zinc-800 hover:border-zinc-700"
                    >
                      {language === 'ar' ? 'إلغاء والتراجع' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer flex items-center justify-center gap-3 hover:scale-105"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{language === 'ar' ? 'حفظ التغيرات بنجاح' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/pages/AccountAuth.tsx', newContent);
console.log('Successfully replaced profile card section');
