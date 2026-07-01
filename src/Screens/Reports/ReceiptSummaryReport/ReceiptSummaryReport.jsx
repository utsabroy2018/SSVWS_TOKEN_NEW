import { FileExcelOutlined, LoadingOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import Sidebar from '../../../Components/Sidebar'
import { Spin, Tooltip } from 'antd'
import Radiobtn from '../../../Components/Radiobtn'
import TDInputTemplateBr from '../../../Components/TDInputTemplateBr'
import axios from 'axios'
import { url } from '../../../Address/BaseUrl';
import Select from "react-select"
import {
groupReportGroupWiseHeader,
    groupReportGroupWiseHeader_No_CloseDate,
memberwiseDemandReportHeader,
memberwiseReportHeader,
memberwiseReportHeader_No_CloseDate,
Receipt_Summary_Report_CO,
Receipt_Summary_Report_CO_Branch,
Receipt_Summary_Report_Group,
Receipt_Summary_Report_Group_Branch
} from "../../../Utils/Reports/headerMap"
import DynamicTailwindTable from '../../../Components/Reports/DynamicTailwindTable'
import { Message } from '../../../Components/Message'
import moment from 'moment'
import { exportToExcel } from '../../../Utils/exportToExcel'
import { printTableReport } from '../../../Utils/printTableReport'
import DynamicTailwindTableGroup from '../../../Components/Reports/DynamicTailwindTableForGroup'
import { getLocalStoreTokenDts } from '../../../Components/getLocalforageTokenDts'
import { useNavigate } from "react-router"
import { routePaths } from '../../../Assets/Data/Routes'
import DynamicTailwindTableForRecptSumRep from '../../../Components/Reports/DynamicTailwindTableForRecptSumRep'

const options_radio_three = [
    {
        label: "Groupwise",
        value: "G",
    },
    {
        label: "CO-wise",
        value: "C",
    },
    {
        label: "Branchwise",
        value: "B",
    }
]

const options_radio_two = [
    {
        label: "Groupwise",
        value: "G",
    },
    {
        label: "CO-wise",
        value: "C",
    }
]

// const options_1 = [
// 	{
// 		label: "Active",
// 		value: "A",
// 	},
// 	{
// 		label: "In-Active",
// 		value: "I",
// 	},
// ]

	// Branchwise And Divisionwise options
	const brnchwis_divwise = [
	{
		label: "Branchwise",
		value: "B",
	},
	{
		label: "Divisionwise",
		value: "D",
	},
]


const ReceiptSummaryReport = () => {
    const [searchType, setSearchType] = useState(() => "G");
    // const [isActiveOrInActive, setIsActiveOrInActive] = useState(() => "A");
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
	const userDetails = JSON.parse(localStorage.getItem("user_details")) || "";
    const [reportData, setReportData] = useState(() => [])
    const [isLoading,setLoading] = useState(false);
    const [cos, setCOs] = useState([])
    const [selectedOptions, setSelectedOptions] = useState([])
    const [branches, setBranches] = useState([])
    const [selectedCO, setSelectedCO] = useState("")
    const [selectedCOs, setSelectedCOs] = useState([])
    const navigate = useNavigate()

    // Branchwise And Divisionwise options
        const [searchBrnchDiv, setSearchBrnchDiv] = useState(() => "B")
            
    
    // Branchwise And Divisionwise options
	const onChange3BrnDiv = (e) => {
	// RESET branch selection
	setSelectedOptions([])
	// setSelectedOptionsCondition('no-data')

	setSearchBrnchDiv(e)
	getBranches(e)
	}

    const dataToExport = reportData
    const onPressOnSearchButton = async () =>{
        
                try{
                    if(fromDate && toDate){
                    
                        setLoading(true);
                        const branchCodes = selectedOptions?.map((item, i) => item?.value);
                        const coCodes = selectedCOs?.map((item, i) => item?.value)
                        const allCos = cos?.map((item, i) => item?.co_id)
                        const apiName = searchType == 'G' ? 'groupwise_receipt_summary' : searchType == 'B' ? 'branchwise_receipt_summary' : 'cowise_receipt_summary'
                        let payLoad = null;
                        if(searchType == 'C'){
                            payLoad = {
                                from_dt:fromDate,
                                // co_flag:isActiveOrInActive,
                                branch_code:branchCodes?.length === 0 ? [userDetails?.brn_code] : (dropdownOptions.length === branchCodes.length ? 100 : branchCodes),
                                // branch_code:branchCodes?.length === 0 ? [0] : (dropdownOptions.length === branchCodes.length ? 100 : branchCodes),
                                co_id:coCodes?.length === 0
                                    ? selectedCO === "AC"
                                        ? allCos
                                        : [selectedCO]
                                    : coCodes,
                                to_dt: toDate,
                            };
                        }
                        else{
                            payLoad = {
                                from_dt:fromDate,
                                // [searchType == 'G' ? 'group_flag' : "member_flag"]:isActiveOrInActive,
                                branch_code:branchCodes?.length === 0 ? [userDetails?.brn_code] : (dropdownOptions.length === branchCodes.length ? 100 : branchCodes),
                                // branch_code:branchCodes?.length === 0 ? [0] : (dropdownOptions.length === branchCodes.length ? 100 : branchCodes),
                                to_dt: toDate,
                            };
                        }

                        // console.log(payLoad, 'asdasdasdsadasd', userDetails?.brn_code, branchCodes);
                        // return

                        const tokenValue = await getLocalStoreTokenDts(navigate);

                        console.log(payLoad, 'payLoadpayLoadpayLoad');
                        // return;
                        

                        axios.post(`${url}/${apiName}`, payLoad, {
                        headers: {
                        Authorization: `${tokenValue?.token}`, // example header
                        "Content-Type": "application/json", // optional
                        },
                        }).then(res =>{
                                setLoading(false);

                                if(res?.data?.suc === 0){
                                Message('error', res?.data?.msg)
                                navigate(routePaths.LANDING)
                                localStorage.clear()
                                } else {
                                    console.log(res?.data?.msg, 'payLoadpayLoadpayLoad');
                                    if(res?.data?.msg.length > 0){
                                        const dt = res?.data?.msg.map(el => {
                                            el.payment_date = el.payment_date ? moment(el.payment_date).format('DD/MM/YYYY') : '';
                                            // el.bank_name = el.bank_name ? el.bank_name : '';
                                            // el.other_loan_flag = el.other_loan_flag ? (el.other_loan_flag == 'N' ? "No" : 'Yes') : '';
                                            return el;
                                        })
                                        setReportData(dt)
                                    }
                                    else{
                                        Message('warning',"No data found");
                                        setReportData([])
                                    }
                                
                                }
                                // else{
                                //     Message('error',res?.data?.msg);
                                // }
                        }).catch(err =>{
                            setLoading(false);
                            Message('error',err.message);
                        })
                    }
                    else{
                        Message('error','Please select a date')
                    }
                }
                catch(err){
                    setLoading(false);
                    Message('error',err.message);
                }
    }

    const getBranches = async (para) => {
        setBranches([]);
		setLoading(true);

        // Branchwise And Divisionwise options
		var apiUrl = ''

		if(para === 'B'){
			apiUrl = 'fetch_brnname_based_usertype'
		}

		if(para === 'D'){
			apiUrl = 'fetch_divitionwise_branch'
		}

		const creds = {
			emp_id: userDetails?.emp_id,
			user_type: userDetails?.id,
		}

        const tokenValue = await getLocalStoreTokenDts(navigate);

		axios.post(`${url}/${apiUrl}`, para === 'B' ? creds : {}, {
		headers: {
		Authorization: `${tokenValue?.token}`, // example header
		"Content-Type": "application/json", // optional
		},
		})
			.then((res) => {

				if(res?.data?.suc === 0){
                Message('error', res?.data?.msg)
                navigate(routePaths.LANDING)
                localStorage.clear()
                } else {
				setBranches(res?.data?.msg)
                }

			})
			.catch((err) => {
				console.log("ERRRR>>>", err)
				setLoading(false)
			})
		setLoading(false)
	}

	// Branchwise And Divisionwise options
    useEffect(() => {
        getBranches(searchBrnchDiv) 
    }, [])

    useEffect(() => {
        setReportData([])
        if (searchType === "C") {
            getCOs()
        }
    }, [searchType])

        useEffect(() => {
            setSelectedCOs([])
            if (searchType === "C") {
                getCOs()
            }
        }, [selectedOptions])

    // Branchwise And Divisionwise options
	const dropdownOptions = branches?.map((item) => {
		// console.log(item, 'selectedselectedselected', 'item');
	if (searchBrnchDiv === "B") {
		// Branchwise
		return {
			value: item.branch_assign_id,
			label: `${item.branch_name} - ${item.branch_assign_id}`,
		}
	}

	if (searchBrnchDiv === "D") {
		// Divisionwise
		return {
			value: item.branch_code,
			label: `${item.division}`,
		}
	}

	return null
	}).filter(Boolean);

    // Branchwise And Divisionwise options
    useEffect(() => {
    setFromDate('')
    setToDate('')

    setReportData([])
    setSelectedOptions([])
    // setSelectedOptionsCondition("no-data")
    }, [searchBrnchDiv])

    const displayedOptions = selectedOptions.length === dropdownOptions.length ? [{ value: "all", label: "All" }] : selectedOptions;

    const getCOs = async () => {
            setLoading(true)
    
            const branchCodes = selectedOptions?.map((item, i) => item?.value)
            // console.log(branchCodes);
            const creds = {
                branch_code:
                    branchCodes?.length === 0 ? [userDetails?.brn_code] : branchCodes,
            }

            const tokenValue = await getLocalStoreTokenDts(navigate);

            axios
                .post(`${url}/fetch_brn_co`, creds, {
                headers: {
                Authorization: `${tokenValue?.token}`, // example header
                "Content-Type": "application/json", // optional
                },
                })
                .then((res) => {
                    if(res?.data?.suc === 0){
                // Message('error', res?.data?.msg)
                navigate(routePaths.LANDING)
                localStorage.clear()
                } else {
                    setCOs(res?.data?.msg)
}
                })
                .catch((err) => {
                    console.log("ERRRR>>>", err)
                    setLoading(false)
                })
            setLoading(false)
        }
    
	const handleCOChange = (e) => {
		const selectedId = e.target.value
		setSelectedCO(selectedId)
	}

	const dropdownCOs = cos?.map((branch) => ({
		value: branch.co_id,
		label: `${branch.emp_name} - ${branch.co_id}`,
	}))
    
    const displayedCOs = selectedCOs.length === dropdownCOs.length ? [{ value: "all", label: "All" }] : selectedCOs

    const handleMultiSelectChangeCOs = (selected) => {
		if (selected.some((option) => option.value === "all")) {
			setSelectedCOs(dropdownCOs)
		} else {
			setSelectedCOs(selected)
		}
	}

    const fetchSearchTypeName = (searchType) => {
		if (searchType === "B") {
			return "Branchwise"
		} else if (searchType === "G") {
			return "Groupwise"
		} else if (searchType === "C") {
			return "CO-wise"
		}
	}

    const fileName = `Receipt_Report_${fetchSearchTypeName(
		searchType
	)}_${new Date().toLocaleString("en-GB")}.xlsx`
    	
    const handleMultiSelectChange = (selected) => {

        if(searchBrnchDiv === "B"){

		if (selected.some((option) => option.value === "all")) {
			setSelectedOptions(dropdownOptions)
		} else {
			setSelectedOptions(selected)
		}
        } else {
            const selectedArray = Array.isArray(selected)
            ? selected
            : selected
            ? [selected]
            : []
            // console.log(selected, 'selectedselectedselected', selectedArray, 'outside');
            setSelectedOptions(selectedArray)
        }
	}

    const handleMultiSelectChange___ = (selected) => {
		
	// Normalize to array
	const selectedArray = Array.isArray(selected)
	? selected
	: selected
	? [selected]
	: []
	// console.log(selected, 'selectedselectedselected', selectedArray, 'outside');
	setSelectedOptions(selectedArray)

	if (selectedArray.length > 1) {
	// setSelectedOptionsCondition("all")
	} else if (selectedArray.length === 1) {
	// setSelectedOptionsCondition("single")
	} else {
	// setSelectedOptionsCondition("no-data")
	}
	}


    return (
        <div>
            <Sidebar mode={2} />
            <Spin
                indicator={<LoadingOutlined spin />}
                size="large"
                className="text-slate-800 dark:text-gray-400"
                spinning={isLoading}>
                <main className="px-4 pb-5 bg-slate-50 rounded-lg shadow-lg h-auto my-10 mx-32">
                    <div className="flex flex-row gap-3 mt-20  py-3 rounded-xl">
                        <div className="text-3xl text-slate-700 font-bold">
                            Receipt Summary Report
                        </div>
                    </div>


                    {userDetails?.brn_code == 100 && (
						<div className="mb-0 flex justify-start gap-5 items-center">

						<div>
							<Radiobtn
								data={brnchwis_divwise}
								val={searchBrnchDiv}
								onChangeVal={(value) => {
									onChange3BrnDiv(value)
								}}
							/>
						</div>
						{/* {JSON.stringify(searchBrnchDiv, 2)} */}
						
					</div>
					)}

                        <div className="mb-2 grid grid-cols-12 gap-6">
                            <div className='col-span-12 md:col-span-5'>
                                <Radiobtn className='w-full'
                                    data={userDetails?.brn_code == 100 ? options_radio_three : options_radio_two}
                                    val={searchType}
                                    onChangeVal={(value) => {
                                        setSearchType(value);
                                    }}
                                />
                            </div>
                             {/* <div className='col-span-12 md:col-span-6'>
                                <Radiobtn
                                    data={options_1}
                                    val={isActiveOrInActive}
                                    onChangeVal={(value) => {
                                        setIsActiveOrInActive(value);
                                    }}
                                />
                            </div> */}
                        </div>
                      
                        <div className='grid grid-cols-12 gap-3 my-3'>
                              {(userDetails?.id === 3 ||
						userDetails?.id === 4 ||
						userDetails?.id === 11) &&
						userDetails?.brn_code == 100 && (
							<div className="col-span-12">
								<Select
									// options={[{ value: "all", label: "All" }, ...dropdownOptions]}
									// isMulti
									// value={displayedOptions}
                                    // options={[...dropdownOptions]}
                                    options={searchBrnchDiv === "B" ? [{ value: "all", label: "All" }, ...dropdownOptions] : [...dropdownOptions]}
									isMulti={searchBrnchDiv === "B"}
									value={
									searchBrnchDiv === "B"
										? displayedOptions
										: displayedOptions?.[0] || null
									}
									onChange={handleMultiSelectChange}
									// placeholder="Select branches..."
                                    placeholder={
										searchBrnchDiv === "B"
										? "Select branches..."
										: "Select division..."
									}
									className="basic-multi-select"
									classNamePrefix="select"
									styles={{
										control: (provided) => ({
											...provided,
											borderRadius: "8px",
										}),
										valueContainer: (provided) => ({
											...provided,
											borderRadius: "8px",
										}),
										singleValue: (provided) => ({
											...provided,
											color: "black",
										}),
										multiValue: (provided) => ({
											...provided,
											padding: "0.1rem",
											backgroundColor: "#da4167",
											color: "white",
											borderRadius: "8px",
										}),
										multiValueLabel: (provided) => ({
											...provided,
											color: "white",
										}),
										multiValueRemove: (provided) => ({
											...provided,
											color: "white",
											"&:hover": {
												backgroundColor: "red",
												color: "white",
												borderRadius: "8px",
											},
										}),
										placeholder: (provided) => ({
											...provided,
											fontSize: "0.9rem",
										}),
									}}
								/>
							</div>
						)}
                        {/* <div className='col-span-12'>
                                <TDInputTemplateBr
                                placeholder="Select CO..."
                                type="text"
                                label="CO-wise"
                                name="co_id"
                                handleChange={handleCOChange}
                                data={[
                                    { code: "AC", name: "All COs" },
                                    ...cos.map((dat) => ({
                                        code: dat.co_id,
                                        name: `${dat.emp_name}`,
                                    })),
                                ]}
                                mode={2}
                                disabled={false}
                            />      
                        </div> */}

                                            {searchType === "C" &&
                                            (userDetails?.id === 3 ||
                                                userDetails?.id === 4 ||
                                                userDetails?.id === 11) &&
                                            userDetails?.brn_code == 100 ? (
                                                <div className="col-span-12 mx-auto w-[100%]">
                                                    <Select
                                                        options={[{ value: "all", label: "All" }, ...dropdownCOs]}
                                                        isMulti
                                                        value={displayedCOs}
                                                        onChange={handleMultiSelectChangeCOs}
                                                        placeholder="Select COs'..."
                                                        className="basic-multi-select"
                                                        classNamePrefix="select"
                                                        styles={{
                                                            control: (provided) => ({
                                                                ...provided,
                                                                borderRadius: "8px",
                                                            }),
                                                            valueContainer: (provided) => ({
                                                                ...provided,
                                                                borderRadius: "8px",
                                                            }),
                                                            singleValue: (provided) => ({
                                                                ...provided,
                                                                color: "black",
                                                            }),
                                                            multiValue: (provided) => ({
                                                                ...provided,
                                                                padding: "0.1rem",
                                                                backgroundColor: "#da4167",
                                                                color: "white",
                                                                borderRadius: "8px",
                                                            }),
                                                            multiValueLabel: (provided) => ({
                                                                ...provided,
                                                                color: "white",
                                                            }),
                                                            multiValueRemove: (provided) => ({
                                                                ...provided,
                                                                color: "white",
                                                                "&:hover": {
                                                                    backgroundColor: "red",
                                                                    color: "white",
                                                                    borderRadius: "8px",
                                                                },
                                                            }),
                                                            placeholder: (provided) => ({
                                                                ...provided,
                                                                fontSize: "0.9rem",
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                searchType === "C" && (
                                                    <div className="col-span-12 mx-auto w-[100%]">
                                                        <TDInputTemplateBr
                                                            placeholder="Select CO..."
                                                            type="text"
                                                            label="CO-wise"
                                                            name="co_id"
                                                            handleChange={handleCOChange}
                                                            data={[
                                                                { code: "AC", name: "All COs" },
                                                                ...cos.map((dat) => ({
                                                                    code: dat.co_id,
                                                                    name: `${dat.emp_name}`,
                                                                })),
                                                            ]}
                                                            mode={2}
                                                            disabled={false}
                                                        />
                                                    </div>
                                                )
                                            )}
                        
                         </div>   
                        <div className='grid grid-cols-12 gap-3'>
                            <div className='col-span-4'>
                                <TDInputTemplateBr
                                    placeholder="From Date"
                                    type="date"
                                    label="From Date"
                                    name="fromDate"
                                    formControlName={fromDate}
                                    // handleChange={(e) => setFromDate(e.target.value)}
                                    handleChange={(e) => {
                                        const value = e.target.value
                                        setFromDate(value)

                                        // Reset To Date if it's less than new From Date
                                        if (toDate && toDate < value) {
                                            setToDate("")
                                        }
                                    }}
                                    min={"1900-12-31"}
                                    mode={1}
                                />
                            </div>

                            <div className='col-span-4'>
                                <TDInputTemplateBr
                                    placeholder="To Date"
                                    type="date"
                                    label="To Date"
                                    name="toDate"
                                    formControlName={toDate}
                                    handleChange={(e) => setToDate(e.target.value)}
                                    min={fromDate || "1900-12-31"}   // 🔒 KEY LINE
                                    mode={1}
                                />
                            </div>
                            <div className='col-span-12 md:col-span-4 place-content-end'>
                            <button
                                    className={`inline-flex items-center px-4 py-2 mt-0 ml-0 sm:mt-0 text-sm font-small text-center text-white border hover:border-green-600 border-teal-500 bg-teal-500 transition ease-in-out hover:bg-green-600 duration-300 rounded-full  dark:focus:ring-primary-900`}
                                    onClick={() => {
                                        onPressOnSearchButton();
                                    }}
                                >
                                    <SearchOutlined /> <span className={`ml-2`}>Search</span>
                                </button>
                            </div>
                        </div>    

                        <>
                        {/* {JSON.stringify(reportData[0], 2)}  */}
                            {reportData.length > 0 && <DynamicTailwindTableForRecptSumRep
                                data={reportData}
                                pageSize={50}
                                columnTotal={[]}
                                // dateTimeExceptionCols={[0, 1, 20, 22, 27]}
                                headersMap={searchType == 'C' ? 
                                    userDetails?.brn_code != 100 ? Receipt_Summary_Report_CO_Branch : Receipt_Summary_Report_CO               
                                    : userDetails?.brn_code != 100 ? Receipt_Summary_Report_Group_Branch : Receipt_Summary_Report_Group   
                                }
                                // headersMap={headersMap}
                                colRemove={[]}
                                isFooterAvailable={false}
                            />}
                        </>

                        {reportData.length !== 0 && (
						<div className="flex gap-4">
							<Tooltip title="Export to Excel">
								<button
									onClick={() =>{
										exportToExcel(
											dataToExport,
                                            // groupReportGroupWiseHeader,
                                            // isActiveOrInActive === "I" ? groupReportGroupWiseHeader : groupReportGroupWiseHeader_No_CloseDate,
                                            // searchType == 'C' ? Receipt_Summary_Report_CO : Receipt_Summary_Report_Group,
                                            searchType == 'C' ? 
                                            userDetails?.brn_code != 100 ? Receipt_Summary_Report_CO_Branch : Receipt_Summary_Report_CO               
                                            : userDetails?.brn_code != 100 ? Receipt_Summary_Report_Group_Branch : Receipt_Summary_Report_Group,
											fileName,
											[0, 2]
										)
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
									onClick={() =>{
									
										printTableReport(
											dataToExport,
                                            // groupReportGroupWiseHeader,
                                            // searchType == 'C' ? Receipt_Summary_Report_CO : Receipt_Summary_Report_Group,
                                            searchType == 'C' ? 
                                            userDetails?.brn_code != 100 ? Receipt_Summary_Report_CO_Branch : Receipt_Summary_Report_CO               
                                            : userDetails?.brn_code != 100 ? Receipt_Summary_Report_Group_Branch : Receipt_Summary_Report_Group,
											fileName?.split(",")[0],
											[0, 2]
										)
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

export default ReceiptSummaryReport
