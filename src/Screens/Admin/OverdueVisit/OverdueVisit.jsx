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
	overdueVisitHeader,
} from "../../../Utils/Reports/headerMap"
import DynamicTailwindAccordion from "../../../Components/Reports/DynamicTailwindAccordion"
import DynamicTailwindTable from "../../../Components/Reports/DynamicTailwindTable"
import Radiobtn from "../../../Components/Radiobtn"
import { printTableReport } from "../../../Utils/printTableReport"
import { useNavigate } from "react-router"
import { routePaths } from "../../../Assets/Data/Routes"
import { getLocalStoreTokenDts } from "../../../Components/getLocalforageTokenDts"


function OverdueVisit({ branchCode = 100 }) {
	const userDetails = JSON.parse(localStorage.getItem("user_details")) || ""
	const [loading, setLoading] = useState(false)

	const [fromDate, setFromDate] = useState()
	const [toDate, setToDate] = useState()
	const [branch, setBranch] = useState(() =>
		+branchCode !== 100
			? `${userDetails?.brn_code},${userDetails?.branch_name}`
			: ""
	)
	const [branches, setBranches] = useState(() => [])

	const [overdueListData, setOverdueListData] = useState(() => [])

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

	const fetchOverdueList = async () => {
		setOverdueListData([])
		setLoading(true)
		const tokenValue = await getLocalStoreTokenDts(navigate);
		const creds = {
		id: userDetails?.id,
		branch_code: userDetails?.brn_code,
		emp_id: userDetails?.emp_id,
		from_dt: formatDateToYYYYMMDD(fromDate),
		to_dt: formatDateToYYYYMMDD(toDate),
		}

		axios.post(`${url}/app_visit_op/fetch_list_save_visit_operation`, creds, {
		headers: {
		Authorization: `${tokenValue?.token}`, // example header
		"Content-Type": "application/json", // optional
		},
		}).then((res) => {
		if(res?.data?.suc === 0){
        Message('error', res?.data?.msg)
		// navigate(routePaths.LANDING)
		// localStorage.clear()
		setOverdueListData([])
		} else {
			console.log("userDetailsuserDetailsuserDetailsuserDetails", res?.data)
			Message('success',res?.data?.msg)
			setOverdueListData(res?.data?.data)
		}
		setLoading(false)
		})
	}

	useEffect(() => {
		handleFetchBranches()
	}, [])

	const filteredOverdueListData = overdueListData.map(
	({ member_code, loan_id, ...rest }) => ({
	...rest,
	action: (
	<button
	className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
	onClick={() => handleView(loan_id)}
	>
	View
	</button>
	),
	})
	);

	const handleView = (loanId) => {
	console.log("View Loan ID:", loanId);

	// your navigation or modal logic here
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

					<div className="grid grid-cols-3 gap-5 mt-5">

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

						
						

						<div className="flex justify-center col-span-3">
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

					{/* <>{JSON.stringify(overdueListData[0], null, 2)}</> */}

					<DynamicTailwindTable
					data={filteredOverdueListData}
					headersMap={overdueVisitHeader}
					pageSize={20}
					indexing
					dateTimeExceptionCols={[4]}
					/>								
			
					
				</main>
			</Spin>
		</div>
	)
}

export default OverdueVisit
