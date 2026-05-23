// ══════════════════════════════════════════════════════════════
// FarmTrack — i18n translations  (VI / JA)
// ══════════════════════════════════════════════════════════════
export const T = {
  vi: {
    // ── Sidebar / Layout ──────────────────────────────────────
    nav_dashboard: 'Tổng quan',
    nav_tech:      'Phân tích kỹ thuật',
    nav_feed:      'Quản lý cám',
    nav_flock:     'Đàn gà',
    nav_molt:      'Molting (Ép thay lông)',
    nav_report:    'Báo cáo',
    nav_alert:     'Cảnh báo',
    nav_settings:  'Cài đặt',
    role_admin:    'Quản trị viên',
    role_staff:    'Nhân viên',
    logout:        'Đăng xuất',
    loading:       'Đang tải...',

    // ── Dashboard header ──────────────────────────────────────
    farm_overview:  'TỔNG QUAN TRẠI',
    last_updated:   'Cập nhật lần cuối:',
    btn_today:      'Hôm nay',
    btn_7d:         '7 ngày',
    btn_30d:        '30 ngày',
    export_report:  '↓ Xuất báo cáo',

    // ── Filters ───────────────────────────────────────────────
    select_zone:  'Chọn khu',
    select_house: 'Chọn nhà',
    select_breed: 'Chọn giống',
    all_zones:    'Tất cả khu',
    all_houses:   'Tất cả nhà',
    all_breeds:   'Tất cả giống',
    total_flock:  'Tổng đàn:',
    unit_birds:   'con',

    // ── KPI card labels ───────────────────────────────────────
    kpi_henDay:    'Tỷ lệ đẻ (HD%)',
    kpi_eggs:      'Trứng hôm nay',
    kpi_mort:      'Tỷ lệ chết',
    kpi_survival:  'Tỷ lệ sống',
    kpi_feed:      'Feed Intake',
    kpi_water:     'Water Intake',
    kpi_feedWater: 'Feed/Water',
    kpi_temp:      'Nhiệt độ TB',
    kpi_eggWeight: 'KL Trứng',
    kpi_birds:     'Số gà hiện tại',
    yesterday:     'Hôm qua:',

    // ── Chart section titles ──────────────────────────────────
    trend_7d:    'Xu hướng 7 ngày qua',
    breed_pie:   'Tổng đàn theo giống',
    zone_pie:    'Tổng đàn theo khu',
    zone_table:  'Tổng quan theo khu',
    alert_title: 'Cảnh báo hệ thống',
    alert_all:   'Xem tất cả →',
    feed_eff:    'Hiệu quả sử dụng thức ăn',
    egg_quality: 'Chất lượng trứng',
    egg_size:    'Phân bố size trứng (hôm nay)',

    // ── Chart line names ──────────────────────────────────────
    line_henDay: 'Tỷ lệ đẻ (%)',
    line_feed:   'Feed (g)',
    line_water:  'Water (ml)',
    line_mort:   'Mort (%)',

    // ── Zone table headers ────────────────────────────────────
    th_zone:   'Khu',
    th_houses: 'Số nhà',
    th_birds:  'Đàn gà',
    th_hd:     'HD%',
    th_mort:   'Tỷ lệ chết',
    th_temp:   'Nhiệt độ',
    th_feed:   'Feed (g)',
    th_water:  'Water (ml)',
    th_trend:  'Trend',
    total:     'Tổng cộng',

    // ── Alert badges ──────────────────────────────────────────
    badge_danger:  'Nguy hiểm',
    badge_warning: 'Cảnh báo',
    badge_info:    'Thông tin',

    // ── Feed / Egg sections ───────────────────────────────────
    vs_yesterday: 'vs hôm qua',
    dirty_egg:    'Trứng bẩn',
    cracked_egg:  'Trứng vỡ',
    saleable_egg: 'Trứng đạt chuẩn',
    std_label:    'Chuẩn:',

    // ── Tech page header ──────────────────────────────────────
    tech_breadcrumb: 'Phân tích kỹ thuật › Chi tiết nhà',
    tech_title:      'PHÂN TÍCH KỸ THUẬT',
    period_7d:       '7 ngày gần nhất',
    period_30d:      '30 ngày',
    period_all:      'Toàn kỳ',
    compare_house:   '= So sánh nhà',

    // ── Tech house info ───────────────────────────────────────
    breed_label:    'Giống:',
    age_label:      'Tuổi:',
    age_unit:       'ngày',
    phase_label:    'Giai đoạn:',
    bird_count:     'Số gà hiện tại',
    entry_date:     'Ngày vào đàn',
    lay_start:      'Ngày bắt đầu đẻ',
    perf_title:     'HIỆU SUẤT TỔNG HỢP',
    perf_good:      'Hiệu suất tốt',
    perf_vs_breed:  'Đạt',
    perf_vs_week:   'so với chuẩn giống',
    perf_up_week:   '↑ 3 điểm so với tuần trước',

    // ── Tech KPI card ─────────────────────────────────────────
    tech_std:      'Chuẩn:',
    tech_survival: 'Tỷ lệ sống',
    tech_henDay:   'Tỷ lệ đẻ (HD%)',
    tech_ewt:      'KL Trứng',
    tech_em:       'Egg Mass',
    tech_dirty:    '% Trứng bẩn',
    tech_cracked:  '% Trứng vỡ',
    tech_saleable: 'Trứng đạt chuẩn',

    // ── Tech section titles ───────────────────────────────────
    sec_phase_sur:  '1. Tỷ lệ sống theo giai đoạn',
    sec_combo:      '2. Tỷ lệ sống · Tỷ lệ đẻ · KL Trứng — Thực tế vs Chuẩn',
    sec_em:         '4. Egg Mass (g/ngày) so với chuẩn',
    sec_nutrition:  '5. Khẩu phần so với chuẩn',
    sec_feed_eff:   '6. Hiệu quả sử dụng thức ăn',
    sec_egg_qual:   '7. Chất lượng trứng & phân bố size',
    sec_alerts:     '11. Cảnh báo kỹ thuật',
    sec_reco:       '12. Khuyến nghị',
    sec_notes:      '13. Ghi chú kỹ thuật',
    sec_house_info: 'Thông tin nhà',

    // ── Phase table headers ───────────────────────────────────
    ph_phase:  'Giai đoạn',
    ph_age:    'Tuổi',
    ph_actual: 'Thực tế',
    ph_std:    'Chuẩn',
    ph_delta:  'Lệch',

    // ── Combo chart legend ────────────────────────────────────
    leg_sur_act: 'Sống TT (%)',
    leg_sur_std: 'Sống Chuẩn (%)',
    leg_hd_act:  'HD% TT',
    leg_hd_std:  'HD% Chuẩn',
    leg_ew_act:  'KL TT (g)',
    leg_ew_std:  'KL Chuẩn (g)',
    leg_surv:    '● Tỷ lệ sống (%)',
    leg_hd:      '● Tỷ lệ đẻ (%)',
    leg_ew:      '● KL Trứng (g)',
    leg_std_dash:'-- Chuẩn',
    age_axis:    'Tuổi (ngày)',

    // ── Nutrition / Feed eff tables ───────────────────────────
    nut_sub:   'Chuẩn',
    th_kpi:    'KPI',
    th_unit:   'Đ/v',
    th_actual: 'TT',
    th_std:    'Chuẩn',
    th_delta:  'Lệch',
    th_eval:   'Đánh giá',
    th_item:   'Chỉ tiêu',
    eval_good:   'Tốt',
    eval_ok:     'Đạt',
    eval_lack:   'Thiếu',
    eval_high:   'Cao',
    feed_intake: 'Feed intake',
    feed_egg:    'Feed/egg',

    // ── Egg quality section ───────────────────────────────────
    qual_kpi:      'KPI CHẤT LƯỢNG',
    trend_7d_cap:  'XU HƯỚNG 7 NGÀY',
    dirty_short:   'Bẩn %',
    cracked_short: 'Vỡ %',
    size_today:    'PHÂN BỐ SIZE TRỨNG (HÔM NAY)',
    size_cmp:      'SO SÁNH VỚI CHUẨN',
    bar_actual:    'Thực tế (%)',
    bar_std:       'Chuẩn (%)',

    // ── Tech alerts / recommendations / notes ─────────────────
    alert_t1: 'Hen Day thấp hơn chuẩn Maria 1.85% ở 300 ngày tuổi.',
    alert_t2: 'Khẩu phần thiếu ME 50 kcal/kg và CP 0.5% so với chuẩn.',
    alert_t3: '% Trứng bẩn tăng 0.3% so với tuần trước.',
    alert_t4: 'Nhiệt độ trung bình cao hơn ngưỡng khuyến nghị.',
    reco1: 'Tăng ME thêm 50 kcal/kg và CP thêm 0.5%.',
    reco2: 'Bổ sung enzyme để cải thiện tiêu hóa và hấp thu.',
    reco3: 'Kiểm tra hệ thống làm mát, giảm nhiệt độ chuồng.',
    reco4: 'Theo dõi Hen Day và Egg Weight trong 7 ngày tới.',
    note1: 'Đàn đang trong giai đoạn Post Peak.',
    note2: 'Hen Day giảm nhưng nằm trong biên độ chấp nhận.',
    note3: 'Cần tối ưu khẩu phần và kiểm soát nhiệt độ để cải thiện hiệu suất.',

    // ── House info labels ─────────────────────────────────────
    cage_type:    'Loại chuồng',
    cage_val:     'Lồng',
    feed_sys:     'Hệ thống cho ăn',
    feed_sys_val: 'Tự động',
    water_sys:    'Hệ thống uống',
    density:      'Mật độ',
    light_sch:    'Lịch chiếu sáng',

    // ── Phase names ───────────────────────────────────────────
    phase_growth:   'Sinh trưởng',
    phase_peak:     'Peak',
    phase_postpeak: 'Post Peak',

    // ── Feed Management page ──────────────────────────────────
    feed_mgmt_title:  'QUẢN LÝ CÁM',
    feed_breadcrumb:  'Quản lý cám',
    tab_overview:     'Tổng quan',
    tab_import:       'Nhập cám',
    tab_usage:        'Tiêu thụ',
    tab_analytics:    'Phân tích FCR',

    // ── Feed KPIs ─────────────────────────────────────────────
    kpi_total_feed:   'Tổng tồn kho',
    kpi_daily_total:  'Tiêu thụ/ngày',
    kpi_fcr:          'FCR trung bình',
    kpi_days_remain:  'Tồn kho TB (ngày)',
    kpi_import_mtd:   'Nhập tháng này',
    days_unit:        'ngày',
    total_label:      'Toàn trại',
    area_houses:      'nhà',

    // ── Status labels ─────────────────────────────────────────
    status_ok:        'Bình thường',
    status_warning:   'Sắp hết',
    status_critical:  'Khẩn cấp',

    // ── Forecast alerts ───────────────────────────────────────
    forecast_crit:             'CẦN NHẬP NGAY',
    forecast_warn:             'Cần nhập trong 7 ngày',
    forecast_critical_houses:  'nhà dưới 3 ngày',
    forecast_warning_houses:   'nhà dưới 7 ngày',

    // ── Inventory table headers ───────────────────────────────
    th_house:       'Nhà',
    th_area:        'Khu',
    th_feed_type:   'Loại cám',
    th_stock_kg:    'Tồn kho (kg)',
    th_daily_avg:   'TB/ngày (kg)',
    th_days_left:   'Còn lại',
    th_last_import: 'Nhập cuối',
    th_status:      'Trạng thái',
    th_action:      'Thao tác',
    th_qty:         'Số lượng (kg)',
    th_date:        'Ngày',
    th_type_col:    'Loại',

    // ── Form labels & buttons ─────────────────────────────────
    lbl_date:       'Ngày',
    lbl_area:       'Khu',
    lbl_house:      'Nhà gà',
    lbl_feed_type:  'Loại cám',
    lbl_qty_kg:     'Khối lượng (kg)',
    lbl_note:       'Ghi chú',
    lbl_supplier:   'Nhà cung cấp',
    btn_save:       'Lưu',
    btn_cancel:     'Hủy',
    btn_add_import: '+ Nhập cám',
    btn_add_usage:  '+ Ghi tiêu thụ',

    // ── Form titles & messages ────────────────────────────────
    import_title:    'NHẬP CÁM',
    usage_title:     'GHI TIÊU THỤ',
    import_success:  'Đã lưu giao dịch nhập cám thành công',
    usage_success:   'Đã ghi nhận lượng cám tiêu thụ',

    // ── Transaction history ───────────────────────────────────
    recent_imports:   'LỊCH SỬ NHẬP CÁM GẦN ĐÂY',
    recent_usage:     'LỊCH SỬ TIÊU THỤ GẦN ĐÂY',
    no_data:          'Chưa có dữ liệu',
    tx_import:        'Nhập',
    tx_consumption:   'Tiêu thụ',

    // ── Analytics ─────────────────────────────────────────────
    fcr_title:           'FCR THEO TUẦN',
    feed_per_bird_title: 'FEED/CON THEO NGÀY (g)',
    fcr_actual:          'FCR thực tế',
    fcr_target:          'FCR mục tiêu',
    feed_actual_label:   'Feed thực tế (g)',
    feed_target_label:   'Feed mục tiêu (g)',
    area_total_stock:    'TỒN KHO THEO KHU',
  },

  // ════════════════════════════════════════════════════════════
  ja: {
    // ── Sidebar / Layout ──────────────────────────────────────
    nav_dashboard: '概況',
    nav_tech:      '技術分析',
    nav_feed:      '飼料管理',
    nav_flock:     '鶏群',
    nav_molt:      '換羽管理',
    nav_report:    'レポート',
    nav_alert:     '警告',
    nav_settings:  '設定',
    role_admin:    '管理者',
    role_staff:    'スタッフ',
    logout:        'ログアウト',
    loading:       '読み込み中...',

    // ── Dashboard header ──────────────────────────────────────
    farm_overview: '農場概況',
    last_updated:  '最終更新：',
    btn_today:     '今日',
    btn_7d:        '7日間',
    btn_30d:       '30日間',
    export_report: '↓ レポート出力',

    // ── Filters ───────────────────────────────────────────────
    select_zone:  '団地選択',
    select_house: '号舎選択',
    select_breed: '品種選択',
    all_zones:    'すべての団地',
    all_houses:   'すべての号舎',
    all_breeds:   'すべての品種',
    total_flock:  '総羽数：',
    unit_birds:   '羽',

    // ── KPI card labels ───────────────────────────────────────
    kpi_henDay:    '産卵率 (HD%)',
    kpi_eggs:      '本日の卵数',
    kpi_mort:      '死亡率',
    kpi_survival:  '生存率',
    kpi_feed:      '飼料摂取量',
    kpi_water:     '飲水量',
    kpi_feedWater: '飼料/飲水比',
    kpi_temp:      '平均温度',
    kpi_eggWeight: '卵重',
    kpi_birds:     '現在の羽数',
    yesterday:     '昨日：',

    // ── Chart section titles ──────────────────────────────────
    trend_7d:    '直近7日間の推移',
    breed_pie:   '品種別羽数',
    zone_pie:    '団地別羽数',
    zone_table:  '団地別概況',
    alert_title: 'システム警告',
    alert_all:   'すべて見る →',
    feed_eff:    '飼料効率',
    egg_quality: '卵質',
    egg_size:    '本日の卵サイズ分布',

    // ── Chart line names ──────────────────────────────────────
    line_henDay: '産卵率 (%)',
    line_feed:   '飼料 (g)',
    line_water:  '飲水 (ml)',
    line_mort:   '死亡率 (%)',

    // ── Zone table headers ────────────────────────────────────
    th_zone:   '団地',
    th_houses: '号舎数',
    th_birds:  '羽数',
    th_hd:     'HD%',
    th_mort:   '死亡率',
    th_temp:   '温度',
    th_feed:   '飼料 (g)',
    th_water:  '飲水 (ml)',
    th_trend:  '傾向',
    total:     '合計',

    // ── Alert badges ──────────────────────────────────────────
    badge_danger:  '危険',
    badge_warning: '警告',
    badge_info:    '情報',

    // ── Feed / Egg sections ───────────────────────────────────
    vs_yesterday: 'vs 昨日',
    dirty_egg:    '汚卵',
    cracked_egg:  '破卵',
    saleable_egg: '規格内卵',
    std_label:    '基準：',

    // ── Tech page header ──────────────────────────────────────
    tech_breadcrumb: '技術分析 › 号舎詳細',
    tech_title:      '技術分析',
    period_7d:       '直近7日間',
    period_30d:      '30日間',
    period_all:      '全期間',
    compare_house:   '= 号舎比較',

    // ── Tech house info ───────────────────────────────────────
    breed_label:   '品種：',
    age_label:     '日齢：',
    age_unit:      '日',
    phase_label:   'ステージ：',
    bird_count:    '現在の羽数',
    entry_date:    '導入日',
    lay_start:     '産卵開始日',
    perf_title:    '総合パフォーマンス',
    perf_good:     '良好',
    perf_vs_breed: '達成',
    perf_vs_week:  '基準比',
    perf_up_week:  '↑ 先週比+3ポイント',

    // ── Tech KPI card ─────────────────────────────────────────
    tech_std:      '基準：',
    tech_survival: '生存率',
    tech_henDay:   '産卵率 (HD%)',
    tech_ewt:      '卵重',
    tech_em:       'エッグマス',
    tech_dirty:    '汚卵率',
    tech_cracked:  '破卵率',
    tech_saleable: '規格内卵率',

    // ── Tech section titles ───────────────────────────────────
    sec_phase_sur: '1. ステージ別生存率',
    sec_combo:     '2. 生存率・産卵率・卵重 — 実績 vs 基準',
    sec_em:        '4. エッグマス (g/日) vs 基準',
    sec_nutrition: '5. 飼料成分 vs 基準',
    sec_feed_eff:  '6. 飼料効率',
    sec_egg_qual:  '7. 卵質・サイズ分布',
    sec_alerts:    '11. 技術警告',
    sec_reco:      '12. 推奨事項',
    sec_notes:     '13. 技術メモ',
    sec_house_info:'号舎情報',

    // ── Phase table headers ───────────────────────────────────
    ph_phase:  'ステージ',
    ph_age:    '日齢',
    ph_actual: '実測値',
    ph_std:    '基準',
    ph_delta:  '偏差',

    // ── Combo chart legend ────────────────────────────────────
    leg_sur_act: '生存率実績 (%)',
    leg_sur_std: '生存率基準 (%)',
    leg_hd_act:  '産卵率実績',
    leg_hd_std:  '産卵率基準',
    leg_ew_act:  '卵重実績 (g)',
    leg_ew_std:  '卵重基準 (g)',
    leg_surv:    '● 生存率 (%)',
    leg_hd:      '● 産卵率 (%)',
    leg_ew:      '● 卵重 (g)',
    leg_std_dash:'-- 基準',
    age_axis:    '日齢 (日)',

    // ── Nutrition / Feed eff tables ───────────────────────────
    nut_sub:   '基準',
    th_kpi:    'KPI',
    th_unit:   '単位',
    th_actual: '実測',
    th_std:    '基準',
    th_delta:  '偏差',
    th_eval:   '評価',
    th_item:   '項目',
    eval_good:   '良好',
    eval_ok:     '達成',
    eval_lack:   '不足',
    eval_high:   '高い',
    feed_intake: '飼料摂取量',
    feed_egg:    '飼料/卵',

    // ── Egg quality section ───────────────────────────────────
    qual_kpi:      '品質KPI',
    trend_7d_cap:  '7日間推移',
    dirty_short:   '汚卵 %',
    cracked_short: '破卵 %',
    size_today:    '本日の卵サイズ分布',
    size_cmp:      '基準との比較',
    bar_actual:    '実績 (%)',
    bar_std:       '基準 (%)',

    // ── Tech alerts / recommendations / notes ─────────────────
    alert_t1: '産卵率がMaria基準より300日齢で1.85%低い。',
    alert_t2: '飼料成分でME 50 kcal/kgとCP 0.5%が基準を下回っている。',
    alert_t3: '汚卵率が先週より0.3%上昇している。',
    alert_t4: '平均温度が推奨値を超えている。',
    reco1: 'ME 50 kcal/kgとCP 0.5%を増加させる。',
    reco2: '消化吸収改善のため酵素を添加する。',
    reco3: '冷却システムを点検し、舎内温度を下げる。',
    reco4: '今後7日間、産卵率と卵重を継続監視する。',
    note1: '鶏群はPost Peakステージにある。',
    note2: '産卵率は低下しているが許容範囲内。',
    note3: '飼料成分の最適化と温度管理により改善が必要。',

    // ── House info labels ─────────────────────────────────────
    cage_type:    'ケージタイプ',
    cage_val:     'ケージ',
    feed_sys:     '給餌システム',
    feed_sys_val: '自動',
    water_sys:    '給水システム',
    density:      '飼育密度',
    light_sch:    '照明スケジュール',

    // ── Phase names ───────────────────────────────────────────
    phase_growth:   '成長期',
    phase_peak:     'Peak',
    phase_postpeak: 'Post Peak',

    // ── Feed Management page ──────────────────────────────────
    feed_mgmt_title:  '飼料管理',
    feed_breadcrumb:  '飼料管理',
    tab_overview:     '概要',
    tab_import:       '飼料受入',
    tab_usage:        '消費記録',
    tab_analytics:    'FCR分析',

    // ── Feed KPIs ─────────────────────────────────────────────
    kpi_total_feed:   '総在庫量',
    kpi_daily_total:  '日次消費量',
    kpi_fcr:          '平均FCR',
    kpi_days_remain:  '平均残日数',
    kpi_import_mtd:   '今月受入量',
    days_unit:        '日',
    total_label:      '農場全体',
    area_houses:      '号舎',

    // ── Status labels ─────────────────────────────────────────
    status_ok:        '正常',
    status_warning:   '残少',
    status_critical:  '緊急',

    // ── Forecast alerts ───────────────────────────────────────
    forecast_crit:             '即時補充必要',
    forecast_warn:             '7日以内に補充必要',
    forecast_critical_houses:  '号舎3日未満',
    forecast_warning_houses:   '号舎7日未満',

    // ── Inventory table headers ───────────────────────────────
    th_house:       '号舎',
    th_area:        '団地',
    th_feed_type:   '飼料種類',
    th_stock_kg:    '在庫 (kg)',
    th_daily_avg:   '平均/日 (kg)',
    th_days_left:   '残日数',
    th_last_import: '最終受入',
    th_status:      'ステータス',
    th_action:      '操作',
    th_qty:         '数量 (kg)',
    th_date:        '日付',
    th_type_col:    '種別',

    // ── Form labels & buttons ─────────────────────────────────
    lbl_date:       '日付',
    lbl_area:       '団地',
    lbl_house:      '号舎',
    lbl_feed_type:  '飼料種類',
    lbl_qty_kg:     '数量 (kg)',
    lbl_note:       '備考',
    lbl_supplier:   '仕入先',
    btn_save:       '保存',
    btn_cancel:     'キャンセル',
    btn_add_import: '+ 飼料受入',
    btn_add_usage:  '+ 消費記録',

    // ── Form titles & messages ────────────────────────────────
    import_title:    '飼料受入登録',
    usage_title:     '消費量記録',
    import_success:  '飼料受入を登録しました',
    usage_success:   '消費量を登録しました',

    // ── Transaction history ───────────────────────────────────
    recent_imports:   '最近の受入履歴',
    recent_usage:     '最近の消費履歴',
    no_data:          'データなし',
    tx_import:        '受入',
    tx_consumption:   '消費',

    // ── Analytics ─────────────────────────────────────────────
    fcr_title:           '週次FCR推移',
    feed_per_bird_title: '飼料摂取量/羽 (g)',
    fcr_actual:          'FCR実績',
    fcr_target:          'FCR目標',
    feed_actual_label:   '飼料実績 (g)',
    feed_target_label:   '飼料目標 (g)',
    area_total_stock:    '団地別在庫量',
  },
};

/** Returns a translator function for the given lang */
export const useT = (lang) => (key) => T[lang]?.[key] ?? T.vi[key] ?? key;


/** Convenience translator: t(key, lang) */
export const t = (key, lang = "vi") => T[lang]?.[key] ?? T.vi[key] ?? key;
