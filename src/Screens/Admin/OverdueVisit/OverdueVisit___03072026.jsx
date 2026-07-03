import React, { useCallback, useEffect, useMemo, useState } from "react"
import Sidebar from "../../../Components/Sidebar"
import axios from "axios"
import { url } from "../../../Address/BaseUrl"
import { Message } from "../../../Components/Message"
import { Spin, Button, Modal, Tooltip, DatePicker, Popconfirm, Tag } from "antd"
import {
	LoadingOutlined,
	SearchOutlined,
	PrinterOutlined,
	FileExcelOutlined,
	CheckCircleOutlined,
	EnvironmentOutlined,
} from "@ant-design/icons"
import TDInputTemplateBr from "../../../Components/TDInputTemplateBr"
import { formatDateToYYYYMMDD } from "../../../Utils/formateDate"

import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { printTableRegular } from "../../../Utils/printTableRegular"
import { exportToExcel } from "../../../Utils/exportToExcel"
import {
	absenteesReportHeader,
	attendanceReportHeader,
	branchwiseTxnReportHeader,
	overdueVisitHeader,
	overdueVisitHeaderReport,
} from "../../../Utils/Reports/headerMap"
import DynamicTailwindAccordion from "../../../Components/Reports/DynamicTailwindAccordion"
import DynamicTailwindTable from "../../../Components/Reports/DynamicTailwindTable"
import Radiobtn from "../../../Components/Radiobtn"
import { printTableReport } from "../../../Utils/printTableReport"
import { useNavigate } from "react-router"
import { routePaths } from "../../../Assets/Data/Routes"
import { getLocalStoreTokenDts } from "../../../Components/getLocalforageTokenDts"
import { useCtrlP } from "../../../Hooks/useCtrlP"


function OverdueVisit({ branchCode = 100 }) {
	const userDetails = JSON.parse(localStorage.getItem("user_details")) || ""
	const [loading, setLoading] = useState(false)

	const [fromDate, setFromDate] = useState()
	const [toDate, setToDate] = useState()
	// const [branch, setBranch] = useState(() =>
	// 	+branchCode !== 100
	// 		? `${userDetails?.brn_code},${userDetails?.branch_name}`
	// 		: ""
	// )

	// const [branch, setBranch] = useState(() => '')
	const [branch, setBranch] = useState(() =>
		branchCode !== 100 ? `${userDetails?.brn_code},${userDetails?.branch_name}` : ""
	)
	const [branches, setBranches] = useState(() => [])

	const [overdueListData, setOverdueListData] = useState(() => [])

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedLoan, setSelectedLoan] = useState(null)
	const [showAddress, setShowAddress] = useState('')
	const [searchText, setSearchText] = useState("")

	// const [employees, setEmployees] = useState(() => [])
	// const [employees, setEmployees] = useState(() => [])
	// const [employee, setEmployee] = useState(() => "")
	const [CEO_DataList, setCEO_DataList] = useState(() => [])
	const [CEO_Selected, setCEO_Selected] = useState(() => "")
	const [CEO_Selected_ALL, setCEO_Selected_ALL] = useState(() => "")
	const [empId, setEmpId] = useState("");

	const navigate = useNavigate()

	const handleFetchBranches = async () => {
		setLoading(true)
		const tokenValue = await getLocalStoreTokenDts(navigate);

		await axios
			.get(`${url}/fetch_all_branch_dt`, {
				headers: {
					Authorization: `${tokenValue?.token}`, // example header
					"Content-Type": "application/json", // optional
				},
			})
			.then((res) => {

				if (res?.data?.suc === 0) {

					// navigate(routePaths.LANDING)
					// localStorage.clear()
					Message('error', res?.data?.msg)

				} else {
					console.log("QQQQQQQQQQQQQQQQ", res?.data)
					setBranches(res?.data?.msg)
				}

			})
			.catch((err) => {
				console.log("?????????????????????", err)
			})

		setLoading(false)
	}

	const fetchOverdueList = async () => {
		setOverdueListData([])
		setLoading(true)

		const tokenValue = await getLocalStoreTokenDts(navigate);

		const creds = {
			id: String(userDetails?.id),
			branch_code: userDetails?.brn_code == 100 ? branch.split(",")[0] : userDetails?.brn_code,
			emp_id: userDetails?.emp_id,
			from_dt: formatDateToYYYYMMDD(fromDate),
			to_dt: formatDateToYYYYMMDD(toDate),
			co_id: CEO_Selected == "all" ? CEO_Selected_ALL : CEO_Selected
		}

		console.log(creds, 'credscredscredscreds');


		axios.post(`${url}/app_visit_op/fetch_list_save_visit_operation`, creds, {
			headers: {
				Authorization: `${tokenValue?.token}`, // example header
				"Content-Type": "application/json", // optional
			},
		}).then((res) => {
			if (res?.data?.suc === 0) {
				Message('error', res?.data?.msg)
				// navigate(routePaths.LANDING)
				// localStorage.clear()
				setOverdueListData([])
			} else {
				console.log("userDetailsuserDetailsuserDetailsuserDetails", res?.data)
				Message('success', res?.data?.msg)
				setOverdueListData(res?.data?.data)
			}
			setLoading(false)
		})
	}

	useEffect(() => {
		handleFetchBranches()
	}, [])

	const handleFetchCEO = async () => {

		setLoading(true)

		const branchId = branch.split(',')[0];

		console.log(branchId.length, 'selectedBranchMMMMMMMMMMMM');

		if (branchId.length === 0 && userDetails?.brn_code !== 100) {
			setCEO_DataList([])
			setLoading(false)
			return;
		}

		const creds = {
			// branch_code: branchCodes?.length === 0 ? [userDetails?.brn_code] : branchCodes,
			branch_code: userDetails?.brn_code == 100 ? [branchId] : [userDetails?.brn_code],
		}

		console.log(creds, 'selectedBranch');
		// return;

		const tokenValue = await getLocalStoreTokenDts(navigate);

		axios
			.post(`${url}/fetch_brn_co`, creds, {
				headers: {
					Authorization: `${tokenValue?.token}`, // example header
					"Content-Type": "application/json", // optional
				},
			})
			.then((res) => {
				if (res?.data?.suc === 0) {
					// Message('error', res?.data?.msg)
					// navigate(routePaths.LANDING)
					// localStorage.clear()
				} else {
					// console.log(res?.data?.msg, 'gggggggggggggggggggg');

					// setEmployees(res?.data?.msg)
					setCEO_DataList([
						{ co_id: "all", emp_name: "All" }, // add All option first
						...res?.data?.msg
					]);
				}
			})
			.catch((err) => {
				console.log("ERRRR>>>", err)
				setLoading(false)
			})
		setLoading(false)
	}

	useEffect(() => {
		handleFetchCEO()
	}, [branch])


	const filteredOverdueListData = overdueListData
		.filter((item) => {

			const search = searchText.toLowerCase()

			return (
				item?.group_code?.toString()?.toLowerCase()?.includes(search) ||
				item?.group_name?.toLowerCase()?.includes(search) ||
				item?.member_name?.toLowerCase()?.includes(search)
			)
		})
		.map((item) => {

			const { member_code, loan_id, branch_code, ...rest } = item

			return {
				...rest,

				action: (
					<button
						className="button_Over_view"
						onClick={() => handleView(item)}
					>
						View
					</button>
				),
			}
		})

	const handleView = async (item) => {

		setLoading(true)
		setIsModalOpen(true)

		setShowAddress('')

		const tokenValue = await getLocalStoreTokenDts(navigate);

		const creds = {
			branch_code: item?.branch_code,
			group_code: item?.group_code,
			member_code: item?.member_code,
			loan_id: item?.loan_id,
		}

		axios.post(`${url}/app_visit_op/fetch_visit_view_data`, creds, {
			headers: {
				Authorization: `${tokenValue?.token}`, // example header
				"Content-Type": "application/json", // optional
			},
		}).then((res) => {

			console.log("userDetailsuserDetailsuserDetailsuserDetails", res?.data)
			// setSelectedLoan(demoData)

			if (res?.data?.suc === 0) {
				Message('error', res?.data?.msg)
				setSelectedLoan([])
			} else {
				Message('success', res?.data?.msg)
				// setOverdueListData(res?.data?.data)
				setSelectedLoan(res?.data)

			}
			setLoading(false)
		})
	}


	const viewAddress = async () => {

		setLoading(true)
		setShowAddress('')

		// await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location?.latitude},${location?.longitude}&key=AIzaSyDdA5VPRPZXt3IiE3zP15pet1Nn200CRzg`)
		await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${selectedLoan?.action_details[0]?.visit_lat},${selectedLoan?.action_details[0]?.visit_long}&key=AIzaSyDdA5VPRPZXt3IiE3zP15pet1Nn200CRzg`)
			.then(res => {
				// handleSave(res?.data?.results[0]?.formatted_address);
				// console.log(res?.data?.results[0]?.formatted_address, 'addresssssssssss');

				setShowAddress(res?.data?.results[0]?.formatted_address)
				setLoading(false);

			}).catch(err => {
				console.log("Error fetching geolocation address", err?.message);
				setLoading(false);
			})

	}

	const [selectedColumns, setSelectedColumns] = useState(null);
	const [md_columns, setColumns] = useState([]);

	const dataToExport = overdueListData;

	const headersToExport = overdueVisitHeaderReport;

	const fileName = `Overdue_Visit_Report${new Date().toLocaleString("en-GB")}.xlsx`

	const handlePrint = useCallback(() => {
		printTableReport(
			dataToExport,
			headersToExport,
			fileName?.split(",")[0],
			[0, 2]
		)
	}, [dataToExport, headersToExport, fileName, printTableReport])

	useCtrlP(handlePrint)
	const populateColumns = (main_dt, headerExport) => {
		const columnToBeShown = Object.keys(main_dt[0]).map((key, index) => ({ header: headerExport[key], index }));
		setColumns(columnToBeShown);
		setSelectedColumns(columnToBeShown.map(el => el.index));
	}


	const prepareModalExportData = () => {
	if (!selectedLoan) return [];

	const member = selectedLoan?.member_details || {};
	const loans = selectedLoan?.loan_details || [];
	const overdue = selectedLoan?.overdue_details || [];
	const actions = selectedLoan?.action_details || [];

	let exportData = [];

	// Member Details
	exportData.push({
		Section: "Member Details",
		Label1: "Visit Date & Time",
		Value1: member?.datetime_visit || "",
		Label2: "Group Name",
		Value2: member?.group_name || "",
		Label3: "Member Name",
		Value3: member?.member_name || "",
		Label4: "Mobile Number",
		Value4: member?.client_mobile || "",
		Label5: "Address",
		Value5: member?.client_addr || "",
		Label6: "",
		Value6: "",
	});

	// Loan Details
	loans.forEach((loan) => {
		exportData.push({
			Section: "Loan Details",
			Label1: "Loan ID",
			Value1: loan?.loan_id || "",
			Label2: "Scheme Name",
			Value2: loan?.scheme_name || "",
			Label3: "Disbursement Date",
			Value3: loan?.disb_dt || "",
			Label4: "EMI Amount",
			Value4: loan?.tot_emi || "",
			Label5: "Member Disbursement",
			Value5: loan?.member_disb_amount || "",
			Label6: "Group Disbursement",
			Value6: loan?.group_disb_amount || "",
		});
	});

	// Overdue Details
	overdue.forEach((item) => {
		exportData.push({
			Section: "Overdue Details",
			Label1: "Overdue Date",
			Value1: item?.overdue_date || "",
			Label2: "Member Overdue Amount",
			Value2: item?.member_overdue_amount || "",
			Label3: "Member Outstanding",
			Value3: item?.member_outstanding || "",
			Label4: "Group Overdue Amount",
			Value4: item?.group_overdue_amount || "",
			Label5: "Group Outstanding",
			Value5: item?.group_outstanding || "",
			Label6: "",
			Value6: "",
		});
	});

	// Visit Action Details
	actions.forEach((action) => {
		exportData.push({
			Section: "Visit Action Details",
			Label1: "Promise Date",
			Value1: action?.promise_date || "",
			Label2: "Promise Amount",
			Value2: action?.promise_amt || "",
			Label3: "Remarks",
			Value3: action?.remarks || "",
			Label4: "",
			Value4: "",
			Label5: "",
			Value5: "",
			Label6: "",
			Value6: "",
		});
	});

	return exportData;
};

const handleModalExport = () => {
	const exportData = prepareModalExportData();

	const groupName = selectedLoan?.member_details?.group_name?.replace(/\s+/g, "_");
	const memberName = selectedLoan?.member_details?.member_name?.replace(/\s+/g, "_");

	if (exportData.length === 0) {
		Message("error", "No data available to export");
		return;
	}

	const worksheet = XLSX.utils.json_to_sheet(exportData);
	const workbook = XLSX.utils.book_new();

	XLSX.utils.book_append_sheet(
		workbook,
		worksheet,
		"Overdue Visit Details"
	);

	XLSX.writeFile(
		workbook,
		`${memberName}_${groupName}_${new Date().getTime()}.xlsx`
	);
};

const handleModalPrint = () => {
	const printData = prepareModalExportData();

	const groupName = selectedLoan?.member_details?.group_name?.replace(/\s+/g, "_");
	const memberName = selectedLoan?.member_details?.member_name?.replace(/\s+/g, "_");

	if (printData.length === 0) {
		Message("error", "No data available to print");
		return;
	}

	// Create dynamic headers from data keys
	const headers = Object.keys(printData[0]).reduce((acc, key) => {
		acc[key] = key;
		return acc;
	}, {});

	printTableReport(
		printData,
		headers,
		`${memberName}_${groupName}_${new Date().getTime()}`
	);
};


	return (
		<div>
			<Spin
				indicator={<LoadingOutlined spin />}
				size="large"
				className="text-slate-800 dark:text-gray-400"
				spinning={loading}
			>
				<main className="px-4 pb-5 bg-slate-50 rounded-lg shadow-lg h-auto my-10 mx-32">
					<div className="flex flex-row gap-3 py-3 rounded-xl">
						<div className="text-3xl text-slate-700 font-bold">
							Overdue Visit
						</div>
					</div>

					{/* <>{JSON.stringify(branch.split(",")[0], null, 2)}</>
					<>{JSON.stringify(userDetails, null, 2)}</> */}


					<div className={userDetails?.brn_code == 100 ? 'grid gap-5 mt-5 grid-cols-4' : 'grid gap-5 mt-5 grid-cols-3'}>

						{userDetails?.brn_code == 100 && (
							<div>
								<TDInputTemplateBr
									placeholder="Branch..."
									type="text"
									label="Branch"
									name="branch"
									formControlName={branch?.split(",")[0]}
									handleChange={(e) => {
										console.log("***********========", e)

										const selectedBranch = branches?.find(
											(i) => i.branch_code == e.target.value
										)

										console.log(selectedBranch, "selectedBranch", e.target.value)

										setBranch(
											e.target.value + "," + selectedBranch?.branch_name
										)
									}}
									mode={2}
									data={branches
										?.filter(
											(item) =>
												item?.branch_code !== 100
										)
										?.map((item) => ({
											code: item?.branch_code,
											name: item?.branch_name + ' (' + item?.branch_code + ')',
										}))
									}
								/>
							</div>
						)}

						<div>
							{/* {userDetails?.brn_code} // {branch.split(',')[0]} // {CEO_Selected}
							{JSON.stringify(CEO_DataList, 2)} ///////////// {JSON.stringify(CEO_Selected_ALL, 2)} */}


							<TDInputTemplateBr
								placeholder="Select CEO's..."
								type="text"
								label="Select CEO's"
								name="employee"
								formControlName={CEO_Selected}
								handleChange={(e) => {
									if (e.target.value === "all") {
										// Select all
										const allEmployeeIds = CEO_DataList.filter((item) => item.co_id !== "all").map((item) => item.co_id);
										setCEO_Selected_ALL(allEmployeeIds);
										setCEO_Selected(e.target.value);
									} else {
										// Single select → save as array
										setCEO_Selected([Number(e.target.value)]);
										setCEO_Selected_ALL("");
									}
								}}
								mode={2}
								data={[
									// ...(employees?.length > 0 ? [{ code: "A", name: "All" }] : []),
									...CEO_DataList?.map((item) => ({
										code: item.co_id,
										name: item.emp_name,
									})),
								]}
							/>
						</div>

						<div>
							<TDInputTemplateBr
								placeholder="From Date"
								type="date"
								label="From Date"
								name="fromDate"
								formControlName={fromDate}
								handleChange={(e) => setFromDate(e.target.value)}
								min={"1900-12-31"}
								mode={1}
							/>
						</div>
						<div>
							<TDInputTemplateBr
								placeholder="To Date"
								type="date"
								label="To Date"
								name="toDate"
								formControlName={toDate}
								handleChange={(e) => {
									setToDate(e.target.value)
								}}
								min={"1900-12-31"}
								mode={1}
							/>
						</div>




						<div className={userDetails?.brn_code == 100 ? 'flex justify-center col-span-4' : 'flex justify-center col-span-3'}>
							<button
								className={`inline-flex items-center px-4 py-2 mt-0 ml-0 sm:mt-0 text-sm font-small text-center text-white border hover:border-green-600 border-teal-500 bg-teal-500 transition ease-in-out hover:bg-green-600 duration-300 rounded-full  dark:focus:ring-primary-900`}
								onClick={() => {
									// if (searchType2 !== "A") {
									// 	handleSubmit()
									// } else {
									// 	handleFetchAbsentList()
									// }
									fetchOverdueList()
								}}
							>
								<SearchOutlined /> <span className={`ml-2`}>Search</span>
							</button>
						</div>
					</div>

					{/* <>{JSON.stringify(overdueListData, null, 2)}</> */}
					<div className="table_overdue">
						{overdueListData && overdueListData.length > 0 && (
							<div className="flex justify-end mt-6 mb-3">
								<div className="w-full md:w-100">
									<input
										type="text"
										placeholder="Search by Group Code, Group Name, Member Name..."
										value={searchText}
										onChange={(e) => setSearchText(e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
									/>
								</div>
							</div>
						)}

						<DynamicTailwindTable
							data={filteredOverdueListData}
							headersMap={overdueVisitHeader}
							pageSize={20}
							indexing
							dateTimeExceptionCols={[4]}
						/>
					</div>


					<Modal
						title={
	<div className="flex items-center justify-between w-full">
		<div className="text-xl font-bold text-slate-700">
			Overdue Visit Details
		</div>

		<div className="flex gap-2 mr-8">
			<Button key="excel" onClick={handleModalExport}>
				<FileExcelOutlined /> Export to Excel
			</Button>

			<Button key="print" onClick={handleModalPrint}>
				<PrinterOutlined /> Print
			</Button>
		</div>
	</div>
}
						open={isModalOpen}
						onCancel={() => setIsModalOpen(false)}
						// footer={[
						// 	<Button key="close" onClick={() => setIsModalOpen(false)}>
						// 		Close
						// 	</Button>,
						// ]}

						footer={[
							// <Button key="excel" onClick={handleModalExport}>
							// 	<FileExcelOutlined /> Export to Excel
							// </Button>,
							// <Button key="print" onClick={handleModalPrint}>
							// 	<PrinterOutlined /> Print
							// </Button>,
							<Button key="close" onClick={() => setIsModalOpen(false)}>
								Close
							</Button>,
						]}
												width={850}
					>
						{selectedLoan && (
							<div className="space-y-5">

								{/* Member Details */}
								<div className="border rounded-xl p-4 bg-gray-50">
									<h2 className="text-lg font-semibold mb-4 text-slate-700">
										Member Details
									</h2>

									<div className="grid grid-cols-2 gap-4 text-sm">

										<div>
											<p className="font-semibold text-gray-500">
												Visit Date & Time
											</p>
											<p>
												{selectedLoan?.member_details?.datetime_visit}
											</p>
										</div>

										<div>
											<p className="font-semibold text-gray-500">
												Group Name
											</p>
											<p>
												{selectedLoan?.member_details?.group_name}
											</p>
										</div>

										<div>
											<p className="font-semibold text-gray-500">
												Member Name
											</p>
											<p>
												{selectedLoan?.member_details?.member_name}
											</p>
										</div>

										<div>
											<p className="font-semibold text-gray-500">
												Mobile Number
											</p>
											<p>
												{selectedLoan?.member_details?.client_mobile}
											</p>
										</div>

										<div className="col-span-2">
											<p className="font-semibold text-gray-500">
												Address
											</p>
											<p>
												{selectedLoan?.member_details?.client_addr}
											</p>
										</div>

									</div>
								</div>

								{/* Loan Details */}
								<div className="border rounded-xl p-4 bg-gray-50">
									<h2 className="text-lg font-semibold mb-4 text-slate-700">
										Loan Details
									</h2>

									{/* {JSON.stringify(selectedLoan?.loan_details.length, 2)} */}

									{selectedLoan?.loan_details?.map((loan, index) => (
										<div
											key={index}
											className="grid grid-cols-2 gap-4 text-sm border-b pb-4 mb-4 last:border-none last:mb-0"
										>

											<div>
												<p className="font-semibold text-gray-500">
													Loan ID
												</p>
												<p>{loan?.loan_id}</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Scheme Name
												</p>
												<p>{loan?.scheme_name}</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Disbursement Date
												</p>
												<p>{loan?.disb_dt}</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													EMI Amount
												</p>
												<p>₹ {loan?.tot_emi}</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Member Disbursement
												</p>
												<p>₹ {loan?.member_disb_amount}</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Group Disbursement
												</p>
												<p>₹ {loan?.group_disb_amount}</p>
											</div>

										</div>
									))}
								</div>

								{/* Overdue Details */}
								<div className="border rounded-xl p-4 bg-red-50">
									<h2 className="text-lg font-semibold mb-4 text-red-600">
										Overdue Details
									</h2>

									{selectedLoan?.overdue_details?.map((overdue, index) => (
										<div
											key={index}
											className="grid grid-cols-2 gap-4 text-sm"
										>

											<div>
												<p className="font-semibold text-gray-500">
													Overdue Date
												</p>
												<p>{overdue?.overdue_date}</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Member Overdue Amount
												</p>
												<p className="text-red-600 font-semibold">
													₹ {overdue?.member_overdue_amount}
												</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Member Outstanding
												</p>
												<p>
													₹ {overdue?.member_outstanding}
												</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Group Overdue Amount
												</p>
												<p>
													₹ {overdue?.group_overdue_amount}
												</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Group Outstanding
												</p>
												<p>
													₹ {overdue?.group_outstanding}
												</p>
											</div>

										</div>
									))}
								</div>

								{/* Action Details */}
								<div className="border rounded-xl p-4 bg-blue-50">
									<h2 className="text-lg font-semibold mb-4 text-indigo-600">
										Visit Action Details
									</h2>

									{selectedLoan?.action_details?.map((action, index) => (
										<div
											key={index}
											className="grid grid-cols-2 gap-4 text-sm"
										>

											<div>
												<p className="font-semibold text-gray-500">
													Promise Date
												</p>
												<p>{action?.promise_date}</p>
											</div>

											<div>
												<p className="font-semibold text-gray-500">
													Promise Amount
												</p>
												<p className="font-semibold text-green-600">
													₹ {action?.promise_amt}
												</p>
											</div>

											{/* <div className="col-span-2">
												<p className="font-semibold text-gray-500">
													Remarks
												</p>
												<p>{action?.remarks}</p>
											</div> */}

											<div className="col-span-2">
												<div className="flex items-center justify-between mb-2">
													<p className="font-semibold text-gray-500">
														Remarks
													</p>
												</div>

												<p className="bg-white border rounded-lg p-3 break-words text-gray-700 leading-6 shadow-sm">
													{action?.remarks}
												</p>

											</div>

											<div className="col-span-2">
												<div className="flex items-center justify-between mb-2">
													<p className="font-semibold text-gray-500">
														Address
													</p>

													<button
														onClick={() => {
															viewAddress()
														}}
														className="flex items-center gap-2 bg-[#DA4167] hover:bg-[#DA4167] text-white text-xs px-3 py-1.5 rounded-sm transition-all duration-200 shadow-sm"
													>
														<EnvironmentOutlined />
														View Location
													</button>
												</div>

												{showAddress && (
													<>
														<p className="bg-white border rounded-lg p-3 break-words text-gray-700 leading-6 shadow-sm">
															{showAddress}
														</p>

														{/* Google Map */}
														<div className="w-full h-[250px] rounded-lg overflow-hidden border shadow-sm mt-5">
															<iframe
																width="100%"
																height="100%"
																frameBorder="0"
																scrolling="no"
																marginHeight="0"
																marginWidth="0"
																src={`https://maps.google.com/maps?q=${selectedLoan?.action_details[0]?.visit_lat},${selectedLoan?.action_details[0]?.visit_long}&z=15&output=embed`}
																title="location-map"
															/>
														</div>
													</>
												)}

											</div>


											<div className="col-span-2">
												<p className="font-semibold text-gray-500 mb-2">
													Uploaded Image
												</p>

												<img
													src={`${url}${action?.upload_img}`}
													alt="visit"
													className="w-100 h-100 object-cover rounded-lg border"
												/>
											</div>

										</div>
									))}
								</div>

							</div>
						)}
					</Modal>

					{/* {JSON.stringify(overdueListData, 2)} */}

					{overdueListData.length !== 0 && (
						<div className="flex gap-4">
							<Tooltip title="Export to Excel">
								<button
									onClick={() => {
										let exportedDT = [...dataToExport];

										exportToExcel(
											exportedDT,
											overdueVisitHeaderReport,
											fileName,
											[0, 2]
										);
									}}
									className="mt-5 justify-center items-center rounded-full text-green-900"
								>
									<FileExcelOutlined
										style={{
											fontSize: 30,
										}}
									/>
								</button>
							</Tooltip>
							<Tooltip title="Print">
								<button
									onClick={() => {
										let exportedDT = [...dataToExport];

										printTableReport(
											exportedDT,
											overdueVisitHeaderReport,
											fileName?.split(",")[0],
											[0, 2]
										);
									}}
									className="mt-5 justify-center items-center rounded-full text-pink-600"
								>
									<PrinterOutlined
										style={{
											fontSize: 30,
										}}
									/>
								</button>
							</Tooltip>
						</div>
					)}


				</main>
			</Spin>
		</div>
	)
}

export default OverdueVisit
