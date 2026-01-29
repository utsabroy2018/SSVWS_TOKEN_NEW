import React, { useEffect, useMemo, useState } from "react"
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
} from "../../../Utils/Reports/headerMap"
import DynamicTailwindAccordion from "../../../Components/Reports/DynamicTailwindAccordion"
import DynamicTailwindTable from "../../../Components/Reports/DynamicTailwindTable"
import Radiobtn from "../../../Components/Radiobtn"
import { printTableReport } from "../../../Utils/printTableReport"
import { useNavigate } from "react-router"
import { routePaths } from "../../../Assets/Data/Routes"
import { getLocalStoreTokenDts } from "../../../Components/getLocalforageTokenDts"
import RouteMap from "../../../Components/RouteMap"

// const { RangePicker } = DatePicker
// const dateFormat = "YYYY/MM/DD"

// const options = [
// 	{
// 		label: "All",
// 		value: "",
// 	},
// 	{
// 		label: "Late In",
// 		value: "L",
// 	},
// 	{
// 		label: "Early Out",
// 		value: "E",
// 	},
// 	// {
// 	// 	label: "Absent",
// 	// 	value: "A",
// 	// },
// ]

// const options2 = [
// 	{
// 		label: "Normal",
// 		value: "N",
// 	},
// 	{
// 		label: "Absent",
// 		value: "A",
// 	},
// ]

function COTracking({ branchCode = 100 }) {
	const userDetails = JSON.parse(localStorage.getItem("user_details")) || ""
	const [loading, setLoading] = useState(false)

	// const [searchType, setSearchType] = useState(() => "")
	// const [searchType2, setSearchType2] = useState(() => "N")

	const [fromDate, setFromDate] = useState()
	const [toDate, setToDate] = useState()
	const [reportData, setReportData] = useState(() => [])
	// const [absentListData, setAbsentListData] = useState(() => [])
	const [branch, setBranch] = useState(() =>
		+branchCode !== 100
			? `${userDetails?.brn_code},${userDetails?.branch_name}`
			: ""
	)
	const [branches, setBranches] = useState(() => [])
	const [employees, setEmployees] = useState(() => [])
	const [employee, setEmployee] = useState(() => "")
	const [empId, setEmpId] = useState("");
	const [selectData, setSelectData] = useState("");

	// const [tot_present, setTotPresent] = useState(() => 0)
	// const [tot_early_out, setTotEarlyOut] = useState(() => 0)
	// const [tot_late_in, setTotLateIn] = useState(() => 0)
	// const [tot_hours, setTothours] = useState(() => 0)

	// const [metadataDtls, setMetadataDtls] = useState(() => "")

	const navigate = useNavigate()

	// const filteringData = [
	// 	{
	// 		header_name: "late_in",
	// 		value: "L",
	// 	},
	// 	{
	// 		header_name: "late_in",
	// 		value: "E",
	// 	},
	// ]

	// console.log("+branchCode !== 100", +branchCode !== 100)

	// const onChange = (e) => {
	// 	console.log("radio1 checked", e)
	// 	setSearchType(e)
	// }

	// const onChange2 = (e) => {
	// 	console.log("radio1 checked", e)
	// 	setSearchType2(e)
	// }

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

			if(res?.data?.suc === 0){

			navigate(routePaths.LANDING)
			localStorage.clear()
			Message('error', res?.data?.msg)

			} else {
			// console.log("QQQQQQQQQQQQQQQQ", res?.data)
			setBranches(res?.data?.msg)
			}

			})
			.catch((err) => {
				console.log("?????????????????????", err)
			})

		setLoading(false)
	}
	const handleFetchEmployees = async () => {
		setLoading(true)
		const tokenValue = await getLocalStoreTokenDts(navigate);
		await axios
			.post(`${url}/fetch_employee_fr_branch`, {
				branch_id: branch?.split(",")[0],
			}, {
		headers: {
		Authorization: `${tokenValue?.token}`, // example header
		"Content-Type": "application/json", // optional
		},
		})
			.then((res) => {

			if(res?.data?.suc === 0){

			navigate(routePaths.LANDING)
			localStorage.clear()
			// Message('error', res?.data?.msg)

			} else {
			setEmployees(res?.data?.msg)
			}

			})
			.catch((err) => {
				console.log("?????????????????????", err)
			})

		setLoading(false)
	}

	useEffect(() => {
		handleFetchBranches()
	}, [])

	useEffect(() => {
		handleFetchEmployees()
	}, [branch])

	const handleFetchReport = async () => {
		setLoading(true)
		// return;
		
		const tokenValue = await getLocalStoreTokenDts(navigate);

		const creds = {
			act_dt: formatDateToYYYYMMDD(fromDate),
			// to_date: formatDateToYYYYMMDD(toDate),
			// branch_id: userDetails?.brn_code,
			// branch_id: branch.split(",")[0],
			emp_id: employee,
		}
		// console.log("KKKKKKKKKKKKKKKKKKK======", branch)
		await axios.post(`${url}/activity_log`, creds, {
		headers: {
		Authorization: `${tokenValue?.token}`, // example header
		"Content-Type": "application/json", // optional
		},
		})
			.then((res) => {

			// console.log(creds, 'employee', res);
			if(res?.data?.suc === 0){
			
			// Message('error', res?.data?.msg)
			navigate(routePaths.LANDING)
			localStorage.clear()

			} else {

			console.log(creds, 'employee', res?.data?.msg);
			setReportData(res?.data?.msg)
			}

			if (res?.data?.msg?.length == 0) Message("error", "No Data!")
			})
			.catch((err) => {
				console.log("ERRRR>>>", err)
			})

		setLoading(false)
	}



	const handleSubmit = () => {
		if (fromDate && employee) {
			// setEmpId(employee)
			// setSelectData(fromDate)
			handleFetchReport()
		}
	}



	return (
		<div>
			{/* <Sidebar mode={2} /> */}
			<Spin
				indicator={<LoadingOutlined spin />}
				size="large"
				className="text-slate-800 dark:text-gray-400"
				spinning={loading}
			>
				<main className="px-4 pb-5 bg-slate-50 rounded-lg shadow-lg h-auto my-10 mx-32">
					<div className="flex flex-row gap-3 py-3 rounded-xl">
						<div className="text-3xl text-slate-700 font-bold">
							CO Tracking
						</div>
					</div>


					<div className="grid grid-cols-3 gap-5 mt-5">
						{/* {searchType2 !== "A" && ( */}
						<div>
							<TDInputTemplateBr
								placeholder="Select Date"
								type="date"
								label="Select Date"
								name="fromDate"
								formControlName={fromDate}
								handleChange={(e) => setFromDate(e.target.value)}
								min={"1900-12-31"}
								mode={1}
							/>
						</div>

						<div>
							<TDInputTemplateBr
								placeholder="Branch..."
								type="text"
								label="Branch"
								name="branch"
								formControlName={branch?.split(",")[0]}
								handleChange={(e) => {
									console.log("***********========", e)
									// setBranch(
									// 	e.target.value +
									// 		"," +
									// 		branches.filter((i) => i.branch_code == e.target.value)[0]
									// 			?.branch_name
									// )
									setBranch(
										e.target.value +
											"," +
											[
												{ branch_code: "A", branch_name: "All Branches" },
												...branches,
											].filter((i) => i.branch_code == e.target.value)[0]
												?.branch_name
									)
									console.log(branches)
									console.log(
										e.target.value +
											"," +
											[
												{ branch_code: "A", branch_name: "All Branches" },
												...branches,
											].filter((i) => i.branch_code == e.target.value)[0]
												?.branch_name
									)
								}}
								mode={2}
								disabled={+branchCode !== 100}
								// data={branches?.map((item, i) => ({
								// 	code: item?.branch_code,
								// 	name: item?.branch_name,
								// }))}
								data={[
									{ code: "A", name: "All Branches" },
									...branches?.map((item, i) => ({
										code: item?.branch_code,
										name: item?.branch_name,
									})),
								]}
							/>
						</div>
					
							<div>
								<TDInputTemplateBr
									placeholder="Employees..."
									type="text"
									label="Employees"
									name="employee"
									formControlName={employee}
									handleChange={(e) => {
										console.log("***********========", e)
										setEmployee(e.target.value)
										console.log(branches)
									}}
									mode={2}
									data={[
										// { code: "A", name: "All Employees" },
										...employees?.map((item, i) => ({
											code: item?.emp_id,
											name: item?.emp_name,
										})),
									]}
								/>
							</div>
						

						<div className="flex justify-center col-span-3">
							<button
								className={`inline-flex items-center px-4 py-2 mt-0 ml-0 sm:mt-0 text-sm font-small text-center text-white border hover:border-green-600 border-teal-500 bg-teal-500 transition ease-in-out hover:bg-green-600 duration-300 rounded-full  dark:focus:ring-primary-900`}
								onClick={() => {
									// if (searchType2 !== "A") {
										handleSubmit()
									// }
									//  else {
									// 	handleFetchAbsentList()
									// }
								}}
							>
								
								<SearchOutlined /> <span className={`ml-2`}>Search</span>
							</button>
						</div>
					</div>

					{/* <>{JSON.stringify(reportData, null, 2)}</> */}
					 <RouteMap data={reportData} />

					{/* For Recovery/Collection Results MR */}


			{/* <>{JSON.stringify(reportData, null, 2)}</> */}
			
					
				</main>
			</Spin>
		</div>
	)
}

export default COTracking
