import { Edit2, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { preferencesApi } from "../api/modules";
import DataTable from "../components/DataTable";
import MessageBox from "../components/MessageBox";
import PageHeader from "../components/PageHeader";

const emptyForm = {
  phone: "",
  name: "",
  notify_sms: true,
  notify_wechat: false,
  notify_app: false,
  wechat_id: "",
  app_user_id: "",
};

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    preferencesApi.list().then(setPreferences);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (pref) => {
    setEditing(pref);
    setForm({
      phone: pref.phone,
      name: pref.name || "",
      notify_sms: pref.notify_sms,
      notify_wechat: pref.notify_wechat,
      notify_app: pref.notify_app,
      wechat_id: pref.wechat_id || "",
      app_user_id: pref.app_user_id || "",
    });
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validateForm = () => {
    if (!form.phone.trim()) {
      setError("请输入手机号。");
      return false;
    }
    if (!form.notify_sms && !form.notify_wechat && !form.notify_app) {
      setError("至少需要选择一种通知渠道。");
      return false;
    }
    return true;
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!validateForm()) return;
    try {
      if (editing) {
        await preferencesApi.update(editing.phone, form);
        setMessage("偏好设置已更新。");
      } else {
        await preferencesApi.create(form);
        setMessage("偏好设置已创建。");
      }
      load();
      setTimeout(closeModal, 800);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (pref) => {
    if (!confirm(`确定删除 ${pref.phone} 的通知偏好设置？`)) return;
    try {
      await preferencesApi.delete(pref.phone);
      setMessage("偏好设置已删除。");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderChannels = (row) => (
    <div className="channels-list">
      {row.notify_sms && <span className="chip chip-sms">短信</span>}
      {row.notify_wechat && <span className="chip chip-wechat">微信</span>}
      {row.notify_app && <span className="chip chip-app">App</span>}
      {!row.notify_sms && !row.notify_wechat && !row.notify_app && (
        <span className="text-muted">未设置</span>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="收件人通知偏好"
        description="管理收件人的通知渠道偏好，入库时按设置的渠道生成通知。"
        action={
          <div className="header-actions">
            <button className="ghost" onClick={load}>
              <RefreshCw size={16} />刷新
            </button>
            <button className="primary" onClick={openCreate}>
              <Plus size={16} />新增偏好
            </button>
          </div>
        }
      />

      {message && <MessageBox type="success">{message}</MessageBox>}
      {error && <MessageBox type="error">{error}</MessageBox>}

      <section className="panel">
        <DataTable
          rows={preferences}
          columns={[
            { key: "phone", title: "手机号" },
            { key: "name", title: "姓名", render: (row) => row.name || "-" },
            { key: "channels", title: "通知渠道", render: renderChannels },
            { key: "wechat_id", title: "微信号", render: (row) => row.wechat_id || "-" },
            { key: "app_user_id", title: "App用户ID", render: (row) => row.app_user_id || "-" },
            {
              key: "actions",
              title: "操作",
              render: (row) => (
                <div className="row-actions">
                  <button className="ghost small" onClick={() => openEdit(row)}>
                    <Edit2 size={14} />编辑
                  </button>
                  <button className="danger small" onClick={() => handleDelete(row)}>
                    <Trash2 size={14} />删除
                  </button>
                </div>
              ),
            },
          ]}
        />
      </section>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "编辑通知偏好" : "新增通知偏好"}</h2>
              <button className="ghost icon" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <form className="modal-body" onSubmit={submit}>
              <label>
                手机号
                <input
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  disabled={!!editing}
                  placeholder="请输入收件人手机号"
                  required
                />
              </label>
              <label>
                姓名
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="请输入收件人姓名（可选）"
                />
              </label>

              <div className="section-label">通知渠道（至少选择一种）</div>
              <div className="checkbox-group">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="notify_sms"
                    checked={form.notify_sms}
                    onChange={updateField}
                  />
                  <span className="checkbox-mark" />
                  <span>短信通知</span>
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="notify_wechat"
                    checked={form.notify_wechat}
                    onChange={updateField}
                  />
                  <span className="checkbox-mark" />
                  <span>微信通知</span>
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="notify_app"
                    checked={form.notify_app}
                    onChange={updateField}
                  />
                  <span className="checkbox-mark" />
                  <span>App 推送</span>
                </label>
              </div>

              {form.notify_wechat && (
                <label>
                  微信 OpenID
                  <input
                    name="wechat_id"
                    value={form.wechat_id}
                    onChange={updateField}
                    placeholder="请输入微信 OpenID（可选）"
                  />
                </label>
              )}
              {form.notify_app && (
                <label>
                  App 用户ID
                  <input
                    name="app_user_id"
                    value={form.app_user_id}
                    onChange={updateField}
                    placeholder="请输入 App 用户ID（可选）"
                  />
                </label>
              )}

              {message && <MessageBox type="success">{message}</MessageBox>}
              {error && <MessageBox type="error">{error}</MessageBox>}

              <div className="modal-footer">
                <button type="button" className="ghost" onClick={closeModal}>
                  取消
                </button>
                <button type="submit" className="primary">
                  <Save size={16} />
                  {editing ? "保存修改" : "创建偏好"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
