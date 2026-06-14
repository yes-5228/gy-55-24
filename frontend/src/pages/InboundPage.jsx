import { PackagePlus, RefreshCw, Save } from "lucide-react";
import React, { useEffect, useState } from "react";

import { parcelsApi, preferencesApi } from "../api/modules";
import DataTable from "../components/DataTable";
import MessageBox from "../components/MessageBox";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

const initialForm = {
  tracking_no: "",
  sender_name: "",
  receiver_name: "",
  receiver_phone: "",
  carrier: "顺丰",
  size: "medium",
  note: "",
};

const initialPref = {
  notify_sms: true,
  notify_wechat: false,
  notify_app: false,
  wechat_id: "",
  app_user_id: "",
};

export default function InboundPage() {
  const [form, setForm] = useState(initialForm);
  const [pref, setPref] = useState(initialPref);
  const [prefLoaded, setPrefLoaded] = useState(false);
  const [showPrefSection, setShowPrefSection] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadParcels = () => parcelsApi.list().then(setParcels);

  useEffect(() => {
    loadParcels();
  }, []);

  useEffect(() => {
    const phone = form.receiver_phone.trim();
    if (phone.length >= 7) {
      loadPreference(phone);
    } else {
      setPref(initialPref);
      setPrefLoaded(false);
    }
  }, [form.receiver_phone]);

  const loadPreference = async (phone) => {
    try {
      const data = await preferencesApi.getByPhone(phone);
      setPref({
        notify_sms: data.notify_sms ?? true,
        notify_wechat: data.notify_wechat ?? false,
        notify_app: data.notify_app ?? false,
        wechat_id: data.wechat_id || "",
        app_user_id: data.app_user_id || "",
      });
      setPrefLoaded(!!data.id);
      if (data.name && !form.receiver_name) {
        setForm((prev) => ({ ...prev, receiver_name: data.name }));
      }
    } catch {
      setPref(initialPref);
      setPrefLoaded(false);
    }
  };

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const updatePref = (event) => {
    const { name, value, type, checked } = event.target;
    setPref({ ...pref, [name]: type === "checkbox" ? checked : value });
  };

  const savePreference = async () => {
    const phone = form.receiver_phone.trim();
    if (!phone) return;
    if (!pref.notify_sms && !pref.notify_wechat && !pref.notify_app) {
      setError("至少需要选择一种通知渠道。");
      return false;
    }
    try {
      const payload = {
        phone,
        name: form.receiver_name || "",
        notify_sms: pref.notify_sms,
        notify_wechat: pref.notify_wechat,
        notify_app: pref.notify_app,
        wechat_id: pref.wechat_id || "",
        app_user_id: pref.app_user_id || "",
      };
      if (prefLoaded) {
        await preferencesApi.update(phone, payload);
      } else {
        await preferencesApi.create(payload);
        setPrefLoaded(true);
      }
      return true;
    } catch (err) {
      setError(`保存偏好失败：${err.message}`);
      return false;
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const prefSaved = await savePreference();
    if (!prefSaved && showPrefSection) return;
    try {
      const created = await parcelsApi.inbound(form);
      setMessage(`入库成功，柜格 ${created.locker_cell_detail.code}，取件码 ${created.pickup_code}。`);
      setForm(initialForm);
      setPref(initialPref);
      setPrefLoaded(false);
      setShowPrefSection(false);
      loadParcels();
    } catch (err) {
      setError(err.message);
    }
  };

  const prefSummary = () => {
    const items = [];
    if (pref.notify_sms) items.push("短信");
    if (pref.notify_wechat) items.push("微信");
    if (pref.notify_app) items.push("App");
    return items.length ? items.join("、") : "未设置";
  };

  return (
    <>
      <PageHeader title="快件入库" description="登记快件后自动分配空柜格，并生成取件码与通知记录。" />
      <section className="work-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <h2>入库登记</h2>
          <label>运单号<input name="tracking_no" value={form.tracking_no} onChange={updateField} required /></label>
          <label>寄件方<input name="sender_name" value={form.sender_name} onChange={updateField} required /></label>
          <label>收件人<input name="receiver_name" value={form.receiver_name} onChange={updateField} required /></label>
          <label>手机号<input name="receiver_phone" value={form.receiver_phone} onChange={updateField} required /></label>

          <div className="pref-summary-row">
            <span className="text-muted">通知渠道：</span>
            <span className="pref-summary">{prefSummary()}</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowPrefSection(!showPrefSection)}
            >
              {showPrefSection ? "收起" : "修改偏好"}
            </button>
          </div>

          {showPrefSection && (
            <div className="pref-panel">
              <div className="section-label">通知渠道（至少选择一种）</div>
              <div className="checkbox-group">
                <label className="checkbox">
                  <input type="checkbox" name="notify_sms" checked={pref.notify_sms} onChange={updatePref} />
                  <span className="checkbox-mark" />
                  <span>短信通知</span>
                </label>
                <label className="checkbox">
                  <input type="checkbox" name="notify_wechat" checked={pref.notify_wechat} onChange={updatePref} />
                  <span className="checkbox-mark" />
                  <span>微信通知</span>
                </label>
                <label className="checkbox">
                  <input type="checkbox" name="notify_app" checked={pref.notify_app} onChange={updatePref} />
                  <span className="checkbox-mark" />
                  <span>App 推送</span>
                </label>
              </div>
              {pref.notify_wechat && (
                <label>
                  微信 OpenID
                  <input name="wechat_id" value={pref.wechat_id} onChange={updatePref} placeholder="请输入微信 OpenID（可选）" />
                </label>
              )}
              {pref.notify_app && (
                <label>
                  App 用户ID
                  <input name="app_user_id" value={pref.app_user_id} onChange={updatePref} placeholder="请输入 App 用户ID（可选）" />
                </label>
              )}
              <button type="button" className="ghost" onClick={savePreference}>
                <Save size={16} />仅保存偏好
              </button>
            </div>
          )}

          <label>承运商<input name="carrier" value={form.carrier} onChange={updateField} required /></label>
          <label>
            柜格尺寸
            <select name="size" value={form.size} onChange={updateField}>
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </label>
          <label>备注<input name="note" value={form.note} onChange={updateField} /></label>
          <button type="submit"><PackagePlus size={18} />确认入库</button>
          <MessageBox type="success">{message}</MessageBox>
          <MessageBox type="error">{error}</MessageBox>
        </form>
        <section className="panel">
          <div className="panel-title">
            <h2>快件列表</h2>
            <button className="ghost" onClick={loadParcels}><RefreshCw size={16} />刷新</button>
          </div>
          <DataTable
            rows={parcels}
            columns={[
              { key: "tracking_no", title: "运单号" },
              { key: "receiver_name", title: "收件人" },
              { key: "cell", title: "柜格", render: (row) => row.locker_cell_detail?.code },
              { key: "pickup_code", title: "取件码" },
              { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} label={row.status_label} /> },
            ]}
          />
        </section>
      </section>
    </>
  );
}
