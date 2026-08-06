import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const updateCall = `    updateUserProfile({
      fullName: editFullName.trim(),
      avatarUrl: editAvatarUrl.trim(),
      phoneNumber: editPhoneNumber.trim(),
      role: editRole,
      subRole: editSubRole,
      subRoleTitle: finalSubTitle,
    });`;
    
const newUpdateCall = `    updateUserProfile({
      fullName: editFullName.trim(),
      avatarUrl: editAvatarUrl.trim(),
      phoneNumber: editPhoneNumber.trim(),
      role: editRole,
      subRole: editSubRole,
      subRoleTitle: finalSubTitle,
    });
    setProfileSuccessMsg(language === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully');
    setTimeout(() => {
      setProfileSuccessMsg(null);
      setIsEditingProfile(false);
    }, 2000);`;
    
content = content.replace(updateCall, newUpdateCall);
fs.writeFileSync('src/pages/AccountAuth.tsx', content);
console.log('UI Patched');
