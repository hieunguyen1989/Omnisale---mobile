import React, { useState, useRef } from 'react';
import { 
  X, Camera, User, Mail, Phone, Lock, CheckCircle2, 
  AlertCircle, ShieldCheck, KeyRound, Save, Loader2,
  ChevronRight, Smartphone, Eye, EyeOff, Upload, Edit2, Check
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileSettingsProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (user: UserProfile) => void;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ user, onClose, onUpdate }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'verification'>('profile');
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
    phone: user.phone || ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState<'email' | 'phone' | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(user.email || '');
  const [otp, setOtp] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveInfo = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ ...user, name: formData.name, email: formData.email, phone: formData.phone });
      setIsSaving(false);
      alert("Cập nhật thông tin thành công!");
    }, 800);
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setPasswords({ current: '', new: '', confirm: '' });
      setIsSaving(false);
      alert("Đổi mật khẩu thành công!");
    }, 1000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onUpdate({ ...user, avatar: url });
      alert("Đã cập nhật ảnh đại diện!");
    }
  };

  const startVerification = (type: 'email' | 'phone') => {
    setIsVerifying(type);
    setOtp('');
  };

  const handleUpdateVerifyEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempEmail)) {
      alert("Vui lòng nhập email hợp lệ");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ ...user, email: tempEmail, emailVerified: false });
      setFormData(prev => ({ ...prev, email: tempEmail }));
      setIsEditingEmail(false);
      setIsSaving(false);
    }, 500);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      alert("Vui lòng nhập đủ 6 chữ số");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      const updatedUser = { ...user };
      if (isVerifying === 'email') updatedUser.emailVerified = true;
      if (isVerifying === 'phone') updatedUser.phoneVerified = true;
      
      onUpdate(updatedUser);
      setIsVerifying(null);
      setIsSaving(false);
      alert("Xác minh thành công!");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[700px]">
        
        {/* Sidebar Settings Menu */}
        <div className="w-full md:w-72 bg-slate-50 border-r border-slate-100 flex flex-col">
           <div className="p-6 border-b border-slate-200">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                 <User className="text-indigo-600" size={20} /> Tài khoản của tôi
              </h2>
           </div>
           
           <nav className="flex-1 p-3 space-y-1">
              {[
                { id: 'profile', label: 'Thông tin cá nhân', icon: User },
                { id: 'security', label: 'Mật khẩu & Bảo mật', icon: Lock },
                { id: 'verification', label: 'Xác minh danh tính', icon: ShieldCheck },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id as any); setIsEditingEmail(false); setIsVerifying(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeSection === item.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:bg-white/50'
                  }`}
                >
                   <item.icon size={18} />
                   {item.label}
                </button>
              ))}
           </nav>

           <div className="p-4 border-t border-slate-200 bg-slate-100/50">
              <div className="flex items-center gap-3">
                 <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
                 <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user.role}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
           {/* Header Area */}
           <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-xl">
                 {activeSection === 'profile' ? 'Cập nhật thông tin' : activeSection === 'security' ? 'Bảo mật tài khoản' : 'Xác thực thông tin'}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                 <X size={24} />
              </button>
           </div>

           {/* Scrollable Content */}
           <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              
              {activeSection === 'profile' && (
                 <div className="animate-fade-in space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center sm:flex-row gap-6 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                       <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden relative">
                              <img src={user.avatar} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white backdrop-blur-sm">
                                  <Camera size={24} className="mb-1" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Đổi ảnh</span>
                              </div>
                          </div>
                          <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full border-2 border-white shadow-sm sm:hidden">
                             <Camera size={16} />
                          </div>
                          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                       </div>
                       
                       <div className="text-center sm:text-left space-y-2">
                          <div>
                             <h4 className="font-bold text-slate-800 text-lg">Ảnh đại diện</h4>
                             <p className="text-sm text-slate-500">Hỗ trợ JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                          </div>
                          <div className="flex gap-3 justify-center sm:justify-start pt-1">
                             <button 
                               onClick={() => fileInputRef.current?.click()} 
                               className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-sm"
                             >
                                <Upload size={14} /> Tải ảnh lên
                             </button>
                             <button className="px-5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                Xóa ảnh
                             </button>
                          </div>
                       </div>
                    </div>

                    {/* Basic Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                             <User size={16} className="text-indigo-500" /> Tên hiển thị
                          </label>
                          <input 
                             type="text" 
                             value={formData.name}
                             onChange={(e) => setFormData({...formData, name: e.target.value})}
                             className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                             <Mail size={16} className="text-indigo-500" /> Địa chỉ Email
                          </label>
                          <div className="relative">
                             <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium pr-24"
                             />
                             {user.emailVerified ? (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                   <CheckCircle2 size={10} /> ĐÃ XÁC MINH
                                </span>
                             ) : (
                                <button onClick={() => setActiveSection('verification')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-600 hover:underline">XÁC MINH NGAY</button>
                             )}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                             <Phone size={16} className="text-indigo-500" /> Số điện thoại
                          </label>
                          <div className="relative">
                             <input 
                                type="text" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium pr-24"
                             />
                             {user.phoneVerified ? (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                   <CheckCircle2 size={10} /> ĐÃ XÁC MINH
                                </span>
                             ) : (
                                <button onClick={() => setActiveSection('verification')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-600 hover:underline">XÁC MINH NGAY</button>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                       <button 
                         onClick={handleSaveInfo}
                         disabled={isSaving}
                         className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:bg-slate-300"
                       >
                          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                          Lưu thông tin
                       </button>
                    </div>
                 </div>
              )}

              {activeSection === 'security' && (
                 <div className="animate-fade-in space-y-8">
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 items-start">
                       <AlertCircle size={20} className="text-orange-600 shrink-0 mt-0.5" />
                       <div className="text-sm text-orange-800">
                          <strong>Bảo mật tài khoản:</strong> Mật khẩu nên có ít nhất 8 ký tự, bao gồm cả chữ cái, số và ký hiệu để đảm bảo an toàn cao nhất.
                       </div>
                    </div>

                    <div className="max-w-md space-y-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                             <KeyRound size={16} className="text-slate-400" /> Mật khẩu hiện tại
                          </label>
                          <div className="relative">
                             <input 
                                type={showPasswords.current ? "text" : "password"} 
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm pr-10"
                                placeholder="******"
                             />
                             <button 
                                onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                             >
                                {showPasswords.current ? <EyeOff size={16}/> : <Eye size={16}/>}
                             </button>
                          </div>
                       </div>

                       <div className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">Mật khẩu mới</label>
                             <div className="relative">
                                <input 
                                   type={showPasswords.new ? "text" : "password"} 
                                   value={passwords.new}
                                   onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm pr-10"
                                   placeholder="******"
                                />
                                <button 
                                   onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                   {showPasswords.new ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-sm font-bold text-slate-700">Xác nhận mật khẩu mới</label>
                             <div className="relative">
                                <input 
                                   type={showPasswords.confirm ? "text" : "password"} 
                                   value={passwords.confirm}
                                   onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm pr-10"
                                   placeholder="******"
                                />
                                <button 
                                   onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                   {showPasswords.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 flex justify-start">
                       <button 
                         onClick={handleChangePassword}
                         disabled={isSaving || !passwords.new}
                         className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all disabled:bg-slate-300"
                       >
                          Cập nhật mật khẩu
                       </button>
                    </div>
                 </div>
              )}

              {activeSection === 'verification' && (
                 <div className="animate-fade-in space-y-8">
                    {!isVerifying ? (
                       <div className="space-y-6">
                          <h4 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Trạng thái xác thực</h4>
                          
                          <div className="space-y-4">
                             {/* Email Verify Item */}
                             <div className="p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${user.emailVerified ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                      <Mail size={24} />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      {isEditingEmail ? (
                                          <div className="flex items-center gap-2 animate-fade-in">
                                              <input 
                                                  type="email" 
                                                  value={tempEmail} 
                                                  onChange={(e) => setTempEmail(e.target.value)}
                                                  className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                                                  autoFocus
                                              />
                                              {/* Fixed missing icon import here */}
                                              <button onClick={handleUpdateVerifyEmail} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"><Check size={16}/></button>
                                              <button onClick={() => { setIsEditingEmail(false); setTempEmail(user.email || ''); }} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-colors"><X size={16}/></button>
                                          </div>
                                      ) : (
                                          <>
                                              <div className="flex items-center gap-2">
                                                  <div className="font-bold text-slate-800 truncate">Email: {user.email}</div>
                                                  <button 
                                                      onClick={() => setIsEditingEmail(true)} 
                                                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                                      title="Đổi email xác minh"
                                                  >
                                                      <Edit2 size={14} />
                                                  </button>
                                              </div>
                                              <div className={`text-xs font-medium ${user.emailVerified ? 'text-green-600' : 'text-slate-400'}`}>
                                                  {user.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                                              </div>
                                          </>
                                      )}
                                   </div>
                                </div>
                                {!user.emailVerified && !isEditingEmail && (
                                   <button 
                                     onClick={() => startVerification('email')}
                                     className="flex items-center gap-1 text-indigo-600 font-bold text-sm hover:underline ml-4"
                                   >
                                      Xác minh <ChevronRight size={16}/>
                                   </button>
                                )}
                             </div>

                             {/* Phone Verify Item */}
                             <div className="p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.phoneVerified ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                      <Smartphone size={24} />
                                   </div>
                                   <div>
                                      <div className="font-bold text-slate-800">Số điện thoại: {user.phone}</div>
                                      <div className={`text-xs font-medium ${user.phoneVerified ? 'text-green-600' : 'text-slate-400'}`}>
                                         {user.phoneVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                                      </div>
                                   </div>
                                </div>
                                {!user.phoneVerified && (
                                   <button 
                                     onClick={() => startVerification('phone')}
                                     className="flex items-center gap-1 text-indigo-600 font-bold text-sm hover:underline"
                                   >
                                      Xác minh <ChevronRight size={16}/>
                                   </button>
                                )}
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="animate-fade-in max-w-md mx-auto text-center space-y-6 py-10">
                          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                             {isVerifying === 'email' ? <Mail size={40}/> : <Smartphone size={40}/>}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800 text-xl">Xác minh {isVerifying === 'email' ? 'Email' : 'Số điện thoại'}</h4>
                             <p className="text-sm text-slate-500 mt-2">Mã xác nhận 6 số đã được gửi đến <span className="font-bold text-slate-700">{isVerifying === 'email' ? user.email : user.phone}</span></p>
                             {isVerifying === 'email' && (
                                <button 
                                    onClick={() => { setIsVerifying(null); setIsEditingEmail(true); }}
                                    className="text-xs text-indigo-600 font-medium hover:underline mt-2 block mx-auto"
                                >
                                    Sai địa chỉ email? Thay đổi ngay
                                </button>
                             )}
                          </div>
                          
                          <div className="space-y-4">
                             <input 
                                type="text" 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder="0 0 0 0 0 0"
                                className="w-full text-center text-3xl font-bold tracking-[1rem] py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                             />
                             <div className="text-sm text-slate-400">
                                Chưa nhận được mã? <button className="text-indigo-600 font-bold hover:underline">Gửi lại (59s)</button>
                             </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                             <button 
                               onClick={() => setIsVerifying(null)}
                               className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl"
                             >
                                Quay lại
                             </button>
                             <button 
                               onClick={handleVerifyOtp}
                               disabled={isSaving || otp.length < 6}
                               className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 disabled:bg-slate-300"
                             >
                                {isSaving ? <Loader2 className="animate-spin mx-auto" size={24}/> : 'Xác nhận'}
                             </button>
                          </div>
                       </div>
                    )}
                 </div>
              )}

           </div>

           {!isVerifying && activeSection === 'verification' && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
                 Tài khoản được xác minh đầy đủ sẽ nhận được nhiều ưu tiên hỗ trợ hơn.
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings;